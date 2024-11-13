import { DateInputs, DateItinerary } from '@/types';

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';
const MODEL = 'llama-3.1-sonar-small-128k-chat';

async function generatePrompt(inputs: DateInputs): Promise<string> {
  // Extract currency symbol from budget
  const currencySymbol = inputs.budget.match(/[£$€]/)?.[0] || '$';
  
  return `You are a date planning expert. Create a romantic date plan with exactly 3 activities based on these preferences:
- Location: ${inputs.location}
- Date: ${inputs.date}
- Time of Day: ${inputs.timeOfDay}
- Partner's Interests: ${inputs.interests}
- Partner's Personality: ${inputs.personality}
- Budget: ${inputs.budget}
- Love Language: ${inputs.loveLanguage}

For each activity, you MUST include:
1. A real, direct booking URL or official website URL for that specific venue/activity in ${inputs.location}
2. The ACTUAL, CURRENT cost of the activity based on real prices from the venue's website or booking platform, using the currency symbol ${currencySymbol}
3. NO placeholder or estimated costs - only use real prices you can verify

Respond with ONLY the following format, no additional text:

Title: [Overall theme of the date]

Activity 1:
Title: [Name of activity]
Time: [Specific time]
Location: [Specific location name and address in ${inputs.location}]
Description: [2-3 sentences about the activity]
Considerations: [Important notes or tips]
Weather: [Weather-related advice]
Travel: [How to get there]
Cost: [Exact current price from venue website, using ${currencySymbol}]
BookingUrl: [Direct URL to book or view this specific venue/activity]

Activity 2:
[Same format as Activity 1]

Activity 3:
[Same format as Activity 1]

Total Cost: [Sum of all activity costs, using ${currencySymbol}]`;
}

// Rest of the file remains unchanged
export async function generateDate(inputs: DateInputs): Promise<DateItinerary> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('API key is not configured. Please set VITE_PERPLEXITY_API_KEY in your environment.');
  }

  try {
    const prompt = await generatePrompt(inputs);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || 
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    const content = data.choices[0].message.content;
    return parseAIResponse(content);
  } catch (error) {
    if (error instanceof Error) {
      const userMessage = error.message.includes('API key') 
        ? 'Configuration error: API key is missing'
        : error.message.includes('fetch') 
          ? 'Network error: Unable to connect to the date planning service'
          : `Error generating date plan: ${error.message}`;
      
      throw new Error(userMessage);
    }
    throw new Error('An unexpected error occurred while generating the date plan');
  }
}

function parseAIResponse(content: string): DateItinerary {
  try {
    const sections = content.split('\n\n').filter(Boolean);
    
    const titleMatch = sections[0].match(/Title:\s*(.+)/);
    if (!titleMatch) throw new Error('Could not parse date title');
    const title = titleMatch[1].trim();

    const activities = [];
    let currentActivity: Record<string, string> = {};
    let totalCost = '';
    
    sections.slice(1).forEach(section => {
      if (section.startsWith('Activity')) {
        if (Object.keys(currentActivity).length > 0) {
          activities.push(currentActivity);
          currentActivity = {};
        }
        
        const lines = section.split('\n');
        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            const keyLower = key.trim().toLowerCase();
            
            switch (keyLower) {
              case 'title':
              case 'time':
              case 'location':
              case 'description':
              case 'considerations':
              case 'weather':
              case 'travel':
              case 'cost':
              case 'bookingurl':
                if (keyLower === 'bookingurl') {
                  try {
                    new URL(value);
                    currentActivity[keyLower] = value;
                  } catch {
                    currentActivity[keyLower] = '';
                  }
                } else {
                  currentActivity[keyLower] = value;
                }
                break;
            }
          }
        });
      } else if (section.startsWith('Total Cost:')) {
        totalCost = section.split(':')[1].trim();
      }
    });

    if (Object.keys(currentActivity).length > 0) {
      activities.push(currentActivity);
    }

    if (activities.length === 0) {
      throw new Error('No activities found in the response');
    }

    return {
      title,
      activities: activities.map(activity => ({
        title: activity.title || 'Untitled Activity',
        time: activity.time || 'Time TBD',
        location: activity.location || 'Location TBD',
        description: activity.description || 'No description available',
        considerations: activity.considerations || 'No special considerations',
        weather: activity.weather || 'Weather information not available',
        travel: activity.travel || 'Travel information not available',
        cost: activity.cost || 'Price not available',
        bookingUrl: activity.bookingurl || undefined
      })),
      totalCost: totalCost || 'Total cost not available'
    };
  } catch (error) {
    throw new Error('Failed to parse the date plan response. Please try again.');
  }
}