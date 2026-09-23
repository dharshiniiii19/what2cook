// src/components/ImageUpload.jsx
import { useState } from "react";
import { fileToBase64 } from "../api";

export default function ImageUpload({ onDetect, loading }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const base64 = await fileToBase64(file);
      onDetect(base64);
    } catch (err) {
      setError("Couldn't read that image. Try a different photo.");
    }
  }

  return (
    <div className="upload-panel">
      <label className="upload-drop" htmlFor="ingredient-photo">
        {previewUrl ? (
          <img src={previewUrl} alt="Selected ingredients" className="upload-preview" />
        ) : (
          <>
            <span className="upload-drop-title">Add a photo of your ingredients</span>
            <span className="upload-drop-sub">Fridge, counter, pantry — whatever you've got</span>
          </>
        )}
      </label>
      <input
        id="ingredient-photo"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        hidden
      />
      {loading && <p className="upload-status">Looking at your ingredients…</p>}
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
