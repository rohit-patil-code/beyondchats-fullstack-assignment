/**
 * VersionToggle Component
 * Toggle between Original and Updated article versions
 * @param {boolean} showUpdated - Whether to show updated version
 * @param {Function} onToggle - Callback when toggle changes
 */
const VersionToggle = ({ showUpdated, onToggle }) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <span className="text-sm font-medium text-gray-700">View:</span>
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
            !showUpdated
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Original
        </button>
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
            showUpdated
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Updated
        </button>
      </div>
    </div>
  );
};

export default VersionToggle;




