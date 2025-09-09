import { TwitterApi } from 'twitter-api-v2';

let twitterClient: TwitterApi | null = null;

export function getTwitterClient() {
  if (!twitterClient) {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      console.warn('Twitter API credentials not configured');
      return null;
    }

    twitterClient = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });
  }

  return twitterClient;
}

export async function postTweet(content: string, llmSource: string, twitterHandle?: string) {
  const client = getTwitterClient();
  
  if (!client) {
    console.error('Twitter client not initialized');
    return null;
  }

  try {
    // Format the tweet
    let tweetText = `"${content}"\n\n— ${llmSource}`;
    
    if (twitterHandle) {
      tweetText += `\n\nSubmitted by @${twitterHandle}`;
    }

    // Ensure tweet doesn't exceed 280 characters
    if (tweetText.length > 280) {
      // Truncate the quote if necessary
      const maxQuoteLength = 280 - (llmSource.length + (twitterHandle ? twitterHandle.length + 18 : 0) + 10);
      const truncatedContent = content.substring(0, maxQuoteLength - 3) + '...';
      tweetText = `"${truncatedContent}"\n\n— ${llmSource}`;
      
      if (twitterHandle) {
        tweetText += `\n\nSubmitted by @${twitterHandle}`;
      }
    }

    // Post the tweet
    const tweet = await client.v2.tweet(tweetText);
    
    return tweet.data.id;
  } catch (error) {
    console.error('Error posting tweet:', error);
    return null;
  }
}