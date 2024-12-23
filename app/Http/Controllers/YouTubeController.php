<?php

namespace App\Http\Controllers;

use Google\Client;
use Google\Service\YouTube;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class YouTubeController extends Controller
{
    private $youtube;

    public function __construct()
    {
        $client = new Client();
        $client->setDeveloperKey(env('YOUTUBE_API_KEY'));
        $this->youtube = new YouTube($client);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        $request->validate(['videoId' => 'required|string']);

        try {
            $video = $this->youtube->videos->listVideos(
                'snippet,statistics',
                ['id' => $request->videoId]
            );

            if (empty($video->items)) {
                return response()->json(['message' => 'Video not found'], 404);
            }

            $videoDetails = $video->items[0];

            return response()->json([
                'title' => $videoDetails->snippet->title,
                'description' => $videoDetails->snippet->description,
                'viewCount' => $videoDetails->statistics->viewCount,
                'likeCount' => $videoDetails->statistics->likeCount,
            ]);
        } catch (\Throwable $th) {
            Log::error('Error fetching video details: ' . $th->getMessage(), ['exception' => $th]);
            return response()->json(['error' => 'Failed to fetch video details'], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function comments(Request $request)
    {
        $request->validate(['videoId' => 'required|string']);

        try {
            $comments = [];
            $nextPageToken = null;
            $retryCount = 0;

            do {
                try {
                    $response = $this->youtube->commentThreads->listCommentThreads('snippet,replies', [
                        'videoId' => $request->videoId,
                        'maxResults' => 100,
                        'pageToken' => $nextPageToken,
                    ]);

                    foreach ($response->items as $item) {
                        $comment = [
                            'comment_id' => $item->id,
                            'text' => $item->snippet->topLevelComment->snippet->textDisplay,
                            'author' => $item->snippet->topLevelComment->snippet->authorDisplayName,
                            'likes' => $item->snippet->topLevelComment->snippet->likeCount,
                            'replies' => [],
                        ];

                        if (isset($item->replies->comments)) {
                            foreach ($item->replies->comments as $reply) {
                                $comment['replies'][] = [
                                    'author' => $reply->snippet->authorDisplayName,
                                    'text' => $reply->snippet->textDisplay,
                                    'likes' => $reply->snippet->likeCount,
                                ];
                            }
                        }

                        $comments[] = $comment;
                    }

                    $nextPageToken = $response->nextPageToken ?? null;

                } catch (\Google_Service_Exception $e) {
                    if ($e->getCode() == 403 && $retryCount < 3) {
                        // Handle rate limiting
                        $retryCount++;
                        $waitTime = pow(2, $retryCount); // Exponential backoff
                        Log::warning('Rate limit exceeded, retrying in ' . $waitTime . ' seconds');
                        sleep($waitTime);
                        continue;
                    }

                    Log::error('Error fetching comments: ' . $e->getMessage(), ['exception' => $e]);

                    return response()->json(['error' => 'Failed to fetch comments'], 500);
                }
            } while ($nextPageToken);

            return response()->json($comments);

        } catch (\Throwable $th) {
            Log::error('Error fetching comments: ' . $th->getMessage(), ['exception' => $th]);

            return response()->json(['error' => 'Failed to fetch comments'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
