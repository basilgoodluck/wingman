import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';

dotenv.config();

class TwitterDataFetcher {
    private twitterClient: TwitterApi;

    constructor() {
        // Use the Bearer token directly
        this.twitterClient = new TwitterApi(process.env.X_BEARER_TOKEN as string);
    }

    async getUserProfile(username: string) {
        try {
            const user = await this.twitterClient.v2.userByUsername(username, {
                'user.fields': ['description', 'public_metrics', 'profile_image_url', 'created_at']
            });
            return user.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async getUserTweets(username: string, maxResults: number = 10) {
        try {
            const userResponse = await this.twitterClient.v2.userByUsername(username);
            if (!userResponse.data) {
                console.error(`User not found: ${username}`);
                return null;
            }
            const tweetsResponse = await this.twitterClient.v2.userTimeline(userResponse.data.id, {
                max_results: maxResults,
                exclude: ['replies', 'retweets'],
                'tweet.fields': ['created_at', 'public_metrics', 'text']
            });
            return tweetsResponse.data;
        } catch (error) {
            console.error('Error fetching user tweets:', error);
            return null;
        }
    }

    async searchTweets(query: string, maxResults: number = 10) {
        try {
            const searchResponse = await this.twitterClient.v2.search(query, {
                max_results: maxResults,
                'tweet.fields': ['created_at', 'public_metrics', 'text']
            });
            return searchResponse.data;
        } catch (error) {
            console.error('Error searching tweets:', error);
            return null;
        }
    }
}

export const fetchTwitterProfile = async (username: string) => {
    const twitterFetcher = new TwitterDataFetcher();
    return await twitterFetcher.getUserProfile(username);
};

async function main() {
    const userProfile = await fetchTwitterProfile('_nobledev');
    console.log('User Profile:', userProfile);
}

// main();
