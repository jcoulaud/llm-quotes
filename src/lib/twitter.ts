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
    // Compute safe max quote length using t.co URL length
    const TCO_URL_LENGTH = 24; // conservative allocation for any URL on X
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://llmquotes.com';

    // Overhead before quote content: opening/closing quotes (2) + two newlines (2) + '— '
    const baseOverhead = 2 + 2 + 2; // = 6
    // LLM source length is added after the dash
    const sourceLen = llmSource.length;
    // Optional submitter block: two newlines + 'Submitted by @' + handle
    const handleBlockLen = twitterHandle
      ? 2 + 'Submitted by @'.length + twitterHandle.length
      : 0;
    // Optional URL block: two newlines + t.co reserved length
    const urlBlockLen = slug ? 2 + TCO_URL_LENGTH : 0;

    const overhead = baseOverhead + sourceLen + handleBlockLen + urlBlockLen;
    const maxQuoteLength = Math.max(0, 280 - overhead);

    let contentToUse = content;
    if (content.length > maxQuoteLength) {
      // Use '...' if we have room, otherwise hard cut
      contentToUse = maxQuoteLength > 3
        ? content.slice(0, maxQuoteLength - 3) + '...'
        : content.slice(0, maxQuoteLength);
    }

    // Build the tweet deterministically after truncation
    let tweetText = `"${contentToUse}"\n\n— ${llmSource}`;
    if (twitterHandle) {
      tweetText += `\n\nSubmitted by @${twitterHandle}`;
    }
    if (slug) {
      const url = `${baseUrl}/quotes/${slug}`;
      tweetText += `\n\n${url}`;
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
      const errorData = error.data as { detail?: string; errors?: Array<{ message?: string }> };
      const reason =
        // v2 style
        errorData?.detail ||
        (Array.isArray(errorData?.errors) && errorData.errors[0]?.message) ||
        error.message ||
        `HTTP ${error.code}`;
      throw new Error(`Twitter error ${error.code ?? ''}: ${reason}`.trim());
    }

    // Fallback for unexpected errors
    console.error('Error posting tweet (unknown):', JSON.stringify(anyErr, null, 2));
    throw new Error(anyErr?.message || 'Unknown error posting tweet');
  }
}
