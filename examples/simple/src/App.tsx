import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { DevCaddy } from "dev-caddy";
import "dev-caddy/dev-caddy.css";

function App() {
  const [count, setCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className="card">
        <button
          onClick={() => setIsModalOpen(true)}
          data-testid="open-modal-btn"
          style={{ marginTop: '1rem' }}
        >
          Open Test Modal
        </button>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* Test Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Test Modal</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="modal-close"
                data-testid="close-modal-btn"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>This is a test modal to verify DevCaddy modal annotation support.</p>
              <p>Try these scenarios:</p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem' }}>
                <li>Activate DevCaddy while modal is open</li>
                <li>Click "Add Annotation" and select elements inside this modal</li>
                <li>Scroll the modal content (if scrollable)</li>
                <li>Close modal while annotation popover is open</li>
              </ul>
              <div style={{ marginTop: '2rem' }}>
                <button data-testid="modal-action-btn" style={{ marginRight: '1rem' }}>
                  Action Button
                </button>
                <button data-testid="modal-cancel-btn">
                  Cancel
                </button>
              </div>
              <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
                <h3>Scrollable Content</h3>
                <p>This area has scrollable content to test popover positioning.</p>
                {[...Array(10)].map((_, i) => (
                  <p key={i}>Scroll item {i + 1} - Try annotating elements in this scrollable area.</p>
                ))}
                <button data-testid="scroll-bottom-btn" style={{ marginTop: '1rem' }}>
                  Button at Bottom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DevCaddy corner="bottom-left" />
    </>
  );
}

export default App;
