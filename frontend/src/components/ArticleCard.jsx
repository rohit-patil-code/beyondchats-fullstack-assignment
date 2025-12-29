import { useNavigate } from 'react-router-dom';

/**
 * ArticleCard Component
 * Displays a single article card with title and badge
 * @param {Object} article - Article object
 */
const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  // Determine badge type based on article properties
  // Assuming backend uses snake_case: is_updated, original_article_id
  const isUpdated = article.isUpdated || article.is_updated;
  const isOriginal = !isUpdated && !article.originalArticleId && !article.original_article_id;

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-800 flex-1 pr-4">
          {article.title}
        </h3>
        <div className="flex-shrink-0">
          {isOriginal ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Original
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Updated
            </span>
          )}
        </div>
      </div>
      
      {article.createdAt && (
        <p className="text-sm text-gray-500 mt-2">
          {new Date(article.createdAt || article.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      )}
    </div>
  );
};

export default ArticleCard;




