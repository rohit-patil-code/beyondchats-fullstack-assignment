import { useState, useEffect } from 'react';
import { getAllArticles } from '../api/articles';
import ArticleCard from '../components/ArticleCard';
import Loader from '../components/Loader';

/**
 * ArticleList Page
 * Displays all articles grouped by Original and Updated versions
 */
const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  /**
   * Fetch all articles from the API
   */
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllArticles();
      
      // Handle both camelCase and snake_case from backend
      const normalizedArticles = data.map(article => ({
        ...article,
        isUpdated: article.isUpdated || article.is_updated || false,
        originalArticleId: article.originalArticleId || article.original_article_id || null,
        createdAt: article.createdAt || article.created_at,
      }));
      
      setArticles(normalizedArticles);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
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
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchArticles}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group articles: originals and their updated versions
  const originalArticles = articles.filter(
    (article) => !article.isUpdated && !article.originalArticleId
  );

  const updatedArticles = articles.filter((article) => article.isUpdated);

  // Create a map of original article IDs to their updated versions
  const updatedMap = {};
  updatedArticles.forEach((article) => {
    const originalId = article.originalArticleId;
    if (originalId) {
      if (!updatedMap[originalId]) {
        updatedMap[originalId] = [];
      }
      updatedMap[originalId].push(article);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse all articles - Original and Updated versions
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new article.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {originalArticles.map((article) => {
              const hasUpdatedVersion = updatedMap[article.id]?.length > 0;
              return (
                <div key={article.id} className="relative">
                  <ArticleCard article={article} />
                  {hasUpdatedVersion && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Has Update
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Also show updated articles that might not have a clear original */}
            {updatedArticles.map((article) => {
              // Only show if we haven't already shown it as related to an original
              const isStandalone = !articles.some(
                (a) => a.id === article.originalArticleId
              );
              if (isStandalone) {
                return <ArticleCard key={article.id} article={article} />;
              }
              return null;
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ArticleList;




