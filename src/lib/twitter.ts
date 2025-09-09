import { TwitterApi, ApiResponseError } from 'twitter-api-v2';

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

export async function postTweet(
  content: string,
  llmSource: string,
  twitterHandle?: string,
  slug?: string
) {
  const client = getTwitterClient();
  
  if (!client) {
    console.error('Twitter client not initialized');
    throw new Error('Twitter client not initialized');
  }

  try {
    // Format the tweet
    let tweetText = `"${content}"\n\n— ${llmSource}`;
    
    if (twitterHandle) {
      tweetText += `\n\nSubmitted by @${twitterHandle}`;
    }

    // Append permalink to drive preview/card rendering on X
    if (slug) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://llmquotes.com';
      const url = `${baseUrl}/quotes/${slug}`;
      tweetText += `\n\n${url}`;
    }

    // Ensure tweet doesn't exceed 280 characters (recalculate after appending URL)
    if (tweetText.length > 280) {
      // Truncate the quote if necessary
      const urlLength = slug ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://llmquotes.com').length + '/quotes/'.length + slug.length : 0;
      // Extra padding accounts for quotes/newlines and attribution text
      const extraPadding = 10 + (twitterHandle ? 18 : 0) + (slug ? 2 : 0); // 2 for the extra newlines before URL
      const maxQuoteLength = 280 - (llmSource.length + urlLength + extraPadding);
      const truncatedContent = content.substring(0, maxQuoteLength - 3) + '...';
      tweetText = `"${truncatedContent}"\n\n— ${llmSource}`;
      
      if (twitterHandle) {
        tweetText += `\n\nSubmitted by @${twitterHandle}`;
      }

      if (slug) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://llmquotes.com';
        const url = `${baseUrl}/quotes/${slug}`;
        tweetText += `\n\n${url}`;
      }
    }

    // Post the tweet
    const tweet = await client.v2.tweet(tweetText);

    return tweet.data.id;
  } catch (error) {
    // Enrich logging with useful details from twitter-api-v2
    const anyErr = error as unknown as {
      code?: number;
      message?: string;
      data?: unknown;
      rateLimit?: unknown;
    };

    if (error instanceof ApiResponseError) {
      const details = {
        status: error.code,
        message: error.message,
        data: error.data,
        rateLimit: error.rateLimit,
      };
      console.error('Error posting tweet (ApiResponseError):', JSON.stringify(details, null, 2));
      // Try to surface a human-readable reason if available
      const reason =
        // v2 style
        (error.data as any)?.detail ||
        (Array.isArray((error.data as any)?.errors) && (error.data as any).errors[0]?.message) ||
        error.message ||
        `HTTP ${error.code}`;
      throw new Error(`Twitter error ${error.code ?? ''}: ${reason}`.trim());
    }

    // Fallback for unexpected errors
    console.error('Error posting tweet (unknown):', JSON.stringify(anyErr, null, 2));
    throw new Error(anyErr?.message || 'Unknown error posting tweet');
  }
}
