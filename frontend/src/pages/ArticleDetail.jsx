import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleById, getAllArticles } from '../api/articles';
import VersionToggle from '../components/VersionToggle';
import Loader from '../components/Loader';

/**
 * ArticleDetail Page
 * Displays article content with ability to toggle between Original and Updated versions
 */
const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [originalArticle, setOriginalArticle] = useState(null);
  const [updatedArticle, setUpdatedArticle] = useState(null);
  const [showUpdated, setShowUpdated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticleData();
  }, [id]);

  /**
   * Fetch article data and its updated version if available
   */
  const fetchArticleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the current article
      const article = await getArticleById(id);
      
      // Normalize field names (handle both camelCase and snake_case)
      const normalizedArticle = {
        ...article,
        isUpdated: article.isUpdated || article.is_updated || false,
        originalArticleId: article.originalArticleId || article.original_article_id || null,
        createdAt: article.createdAt || article.created_at,
      };
      
      if (normalizedArticle.isUpdated && normalizedArticle.originalArticleId) {
        // This is an updated article, fetch the original
        try {
          const original = await getArticleById(normalizedArticle.originalArticleId);
          setOriginalArticle({
            ...original,
            createdAt: original.createdAt || original.created_at,
          });
          setUpdatedArticle(normalizedArticle);
          setShowUpdated(true); // Default to showing updated version
        } catch (err) {
          console.error('Error fetching original article:', err);
          // If we can't fetch original, just show the updated one
          setOriginalArticle(null);
          setUpdatedArticle(normalizedArticle);
        }
      } else {
        // This is an original article, check if there's an updated version
        setOriginalArticle(normalizedArticle);
        setShowUpdated(false); // Default to showing original
        
        // Fetch all articles to find updated versions
        try {
          const allArticles = await getAllArticles();
          const normalizedArticles = allArticles.map(article => ({
            ...article,
            isUpdated: article.isUpdated || article.is_updated || false,
            originalArticleId: article.originalArticleId || article.original_article_id || null,
            createdAt: article.createdAt || article.created_at,
          }));
          const updated = normalizedArticles.find(
            (a) => a.originalArticleId === parseInt(id) || a.originalArticleId === id
          );
          if (updated) {
            setUpdatedArticle(updated);
          }
        } catch (err) {
          console.error('Error checking for updated version:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || (!originalArticle && !updatedArticle)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Error</h3>
              <p className="text-sm text-gray-500">
                {error || 'Article not found'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  // Determine which article to display
  const currentArticle = showUpdated && updatedArticle ? updatedArticle : originalArticle;

  // Function to remove only SVGs from HTML content (keep img tags)
  const removeSvgsFromContent = (html) => {
    if (!html) return '';
    // Remove svg tags only
    let cleaned = html.replace(/<svg[^>]*>.*?<\/svg>/gs, '');
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Articles
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{currentArticle.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Version Toggle - Only show if updated version exists */}
        {updatedArticle && (
          <VersionToggle showUpdated={showUpdated} onToggle={setShowUpdated} />
        )}

        {/* Article Content */}
        <article className="bg-white rounded-lg shadow-md p-8">
          {/* Article Metadata */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {showUpdated && updatedArticle ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Updated Version
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Original
                  </span>
                )}
              </div>
              {currentArticle.createdAt && (
                <p className="text-sm text-gray-500">
                  Published:{' '}
                  {new Date(currentArticle.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Article Content - Render HTML */}
          <div
            className="prose prose-lg max-w-none article-content"
            style={{ overflowX: 'hidden', maxWidth: '100%' }}
            dangerouslySetInnerHTML={{ __html: removeSvgsFromContent(currentArticle.content || '') }}
          />

          {/* References Section - Only show for updated version */}
          {showUpdated && updatedArticle && originalArticle && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">References</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Original Article
                </h3>
                <p className="text-gray-600">{originalArticle.title}</p>
                <button
                  onClick={() => {
                    setShowUpdated(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Original Version →
                </button>
              </div>
            </div>
          )}
        </article>
      </main>

      {/* Add some custom styles for article content */}
      <style>{`
        .article-content h1, .article-content h2, .article-content h3 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 700;
        }
        .article-content p {
          margin-bottom: 1em;
          line-height: 1.75;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5em 0;
        }
        .article-content iframe,
        .article-content embed,
        .article-content video,
        .article-content object {
          max-width: 100%;
          width: 100%;
          aspect-ratio: 16 / 9;
          height: auto;
          display: block;
          border-radius: 0.5rem;
          margin: 1.5em 0;
        }
        .article-content figure,
        .article-content .wp-block-embed,
        .article-content .wp-block-video {
          max-width: 100%;
          width: 100%;
          overflow: hidden;
          margin: 1.5em 0;
        }
        .article-content figure iframe,
        .article-content figure embed,
        .article-content figure video {
          max-width: 100%;
          width: 100%;
          aspect-ratio: 16 / 9;
          height: auto;
        }
        /* Ensure containers for video embeds maintain aspect ratio */
        .article-content figure,
        .article-content .wp-block-embed,
        .article-content .wp-block-video {
          position: relative;
        }
        .article-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .article-content a:hover {
          color: #1d4ed8;
        }
        .article-content ul, .article-content ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        .article-content li {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
};

export default ArticleDetail;

