import { useState } from 'react'
import axios from "axios";
import './App.css'

function App() {
    const [videoId, setVideoId] = useState("");
    const [videoDetails, setVideoDetails] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchVideoDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/video-details", {
                params: { videoId },
            });
            setVideoDetails(response.data);
        } catch (error) {
            console.error("Error fetching video details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        setLoading(true);

        try {
            const response = await axios.get("http://127.0.0.1:8000/api/video-comments", {
                params: { videoId },
            });
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
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
