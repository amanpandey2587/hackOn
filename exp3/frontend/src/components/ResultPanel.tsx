// frontend/components/ResultPanel.tsx

interface Props {
  selectedTitle: string | null;
  loading: boolean;
  error: string | null;
  onLike: () => void;
  onRespin: () => void;
}

export default function ResultPanel({ selectedTitle, loading, error, onLike, onRespin }: Props) {
  return (
    <div className="w-full max-w-md p-4 bg-gray-900 rounded shadow text-center">
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {loading && !selectedTitle && <div className="text-indigo-400">Fetching recommendations...</div>}

      {!loading && selectedTitle && (
        <>
          <h2 className="text-2xl font-bold mb-4">{selectedTitle}</h2>
          <button
            onClick={onLike}
            className="mr-4 px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
          >
            👍 Like
          </button>
          <button
            onClick={onRespin}
            className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 transition"
          >
            🔁 Spin Again
          </button>
        </>
      )}

      {!loading && !selectedTitle && !error && (
        <div className="text-gray-400">Spin the wheel to get recommendations!</div>
      )}
    </div>
  );
}
