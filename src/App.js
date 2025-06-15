import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://api-json-server-rv7s.onrender.com/games";

export default function GamesList() {
  console.log("Renderizando GamesList");

  const [games, setGames] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newImage, setNewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editLink, setEditLink] = useState("");

  useEffect(() => {
    fetch("https://api-json-server-rv7s.onrender.com/games")
      .then((response) => {
        if (!response.ok) throw new Error("Erro na requisição");
        return response.json();
      })
      .then((data) => setGames(data))
      .catch((err) => setError("Erro ao buscar jogos"));
  }, []);

  function addGame() {
    if (!newTitle.trim()) return;
    const newGame = {
      title: newTitle.trim(),
      rating: 0,
      link: newLink.trim() || null,
      image: newImage.trim() || null,
    };

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGame),
    })
      .then((res) => res.json())
      .then((createdGame) => {
        setGames([...games, createdGame]);
        setNewTitle("");
        setNewLink("");
        setNewImage("");
      })
      .catch(() => setError("Erro ao adicionar jogo"));
  }

  function rateGame(id, rating) {
    fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    })
      .then((res) => res.json())
      .then((updatedGame) => {
        setGames(games.map((g) => (g.id === updatedGame.id ? updatedGame : g)));
      })
      .catch(() => setError("Erro ao avaliar o jogo"));
  }

  function startEditing(game) {
    setEditingId(game.id);
    setEditTitle(game.title);
    setEditImage(game.image || "");
    setEditLink(game.link || "");
  }

  function saveEdit(id) {
    const updatedGame = {
      title: editTitle.trim(),
      image: editImage.trim(),
      link: editLink.trim(),
    };

    fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedGame),
    })
      .then((res) => res.json())
      .then((updated) => {
        setGames(games.map((g) => (g.id === updated.id ? updated : g)));
        setEditingId(null);
      })
      .catch(() => setError("Erro ao salvar edição"));
  }

  function deleteGame(id) {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setGames(games.filter((g) => g.id !== id));
      })
      .catch(() => setError("Erro ao deletar jogo"));
  }

  if (loading) return <p className="message">Carregando jogos...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <div class="addGame">
        <h1>Lista de Jogos</h1>
        <div className="form">
          <input
            type="text"
            placeholder="Nome do jogo"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            type="url"
            placeholder="URL imagem de capa (opcional)"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
          />
          <input
            type="url"
            placeholder="Link do jogo (opcional)"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGame()}
          />
          <button onClick={addGame}>Adicionar ✚</button>
        </div>
      </div>
      <ul className="games-list">
        {games.map((game) => (
          <li key={game.id} className="game-item">
            <div className="game-header">
              {editingId === game.id ? (
                <>
                  <input
                    className="edit-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <input
                    className="edit-input"
                    placeholder="URL imagem"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                  />
                  <input
                    className="edit-input"
                    placeholder="Link do jogo"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                  />

                  <button onClick={() => saveEdit(game.id)}>Salvar</button>
                </>
              ) : (
                <>
                  <img
                    src={game.image || "https://via.placeholder.com/60"}
                    alt={game.title}
                    className="game-image"
                  />
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => rateGame(game.id, star)}
                        style={{
                          cursor: "pointer",
                          color: star <= game.rating ? "gold" : "#ccc",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <strong>{game.title}</strong>

                  <div className="game-buttons">
                    {game.link && (
                      <a
                        className="link-btn"
                        href={game.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver ✚
                      </a>
                    )}
                    <button onClick={() => startEditing(game)}>✎</button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteGame(game.id)}
                    >
                      ✖
                    </button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
