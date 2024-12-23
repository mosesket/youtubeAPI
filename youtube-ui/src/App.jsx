import { useState } from 'react'
import axios from "axios";
import './App.css'

function App() {
    const [videoId, setVideoId] = useState("");
    const [videoDetails, setVideoDetails] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVideoDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/video-details", {
                params: { videoId },
            });
            setVideoDetails(response.data);
        } catch (error) {
            setError("Error fetching video details.");
            console.error("Error fetching video details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        setLoading(true);
        let nextPageToken = null;
        let retryCount = 0;
        let fetchedComments = [];

        while (retryCount < 5) {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/video-comments", {
                    params: { videoId, pageToken: nextPageToken },
                });

                fetchedComments = [...fetchedComments, ...response.data];
                nextPageToken = response.data.nextPageToken;

                if (!nextPageToken) {
                    break;
                }
            } catch (error) {
                setError("Error fetching comments.");
                console.error("Error fetching comments:", error);

                if (error.response && error.response.status === 403) {
                    console.log("Rate limit reached, retrying...");
                    if (retryCount < 5) {
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                        retryCount++;
                    } else {
                        setError("Rate limit exceeded. Please try again later.");
                        break;
                    }
                } else {
                    break;
                }
            }
        }

        setComments(fetchedComments);
        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchVideoDetails();
        fetchComments();
    };

    return (
        <div className="container">
            <h1>YouTube Data Viewer</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter YouTube Video ID"
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                />
                <button type="submit">Fetch Data</button>
            </form>

            {loading && (
                <div className="loading">
                    <p>Loading...</p>
                </div>
            )}

            {error && !loading && (
                <div className="error">
                    <p>{error}</p>
                </div>
            )}

            {videoDetails && !loading && (
                <div className="video-details">
                    <h2>Video Details</h2>
                    <p><strong>Title:</strong> {videoDetails.title}</p>
                    <p><strong>Description:</strong> {videoDetails.description}</p>
                    <p><strong>Views:</strong> {videoDetails.viewCount}</p>
                    <p><strong>Likes:</strong> {videoDetails.likeCount}</p>
                </div>
            )}

            {comments.length > 0 && !loading && (
                <div className="comments-list">
                    <h2>Comments</h2>
                    <ul>
                        {comments.map((comment, index) => (
                            <li key={index}>
                                <div>
                                    <strong>{comment.author}</strong>: {comment.text}
                                </div>
                                <div>Likes: {comment.likes}</div>
                                {comment.replies.length > 0 && (
                                    <div className="replies">
                                        <h4>Replies:</h4>
                                        <ul>
                                            {comment.replies.map((reply, idx) => (
                                                <li key={idx}>
                                                    <div>
                                                        <strong>{reply.author}</strong>: {reply.text}
                                                    </div>
                                                    <div>Likes: {reply.likes}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App
