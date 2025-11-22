
import React from "react";

export default function Header({ onNavigate }) {
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    console.log("Searching for:", query);
  };

  return (
    <div className="topbar">
      <div className="search">
        <input 
          type="text" 
          id="quickSearch" 
          placeholder="Search mood, notes, dates..." 
          style={{background: "transparent", border: 0, color: "inherit", outline: 0, width: "320px"}}
          onChange={handleSearch}
        />
      </div>
      <div className="profile">
        <button className="btn btn-ghost" id="newEntryBtn" onClick={() => onNavigate("journal")}>
          + New Entry
        </button>
        <div className="avatar">NA</div>
      </div>
    </div>
  );
}