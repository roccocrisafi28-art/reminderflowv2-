@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FAF9F6;
  color: #1C1C1A;
  font-family: 'Inter', sans-serif;
}

.dark body {
  background-color: #17161A;
  color: #EDEBE4;
}

.font-display {
  font-family: 'Fraunces', serif;
}

.status-pill {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 999px;
  display: inline-block;
}

.card {
  background: #fff;
  border: 1px solid #E4E1D8;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(28, 28, 26, 0.04);
}

.dark .card {
  background: #201F24;
  border-color: #35333A;
  box-shadow: none;
}

.dark input {
  background: #201F24;
  border-color: #35333A;
  color: #EDEBE4;
}

input, button {
  transition: all 0.15s ease;
}

input:focus {
  outline: none;
  border-color: #B5562B;
  box-shadow: 0 0 0 3px rgba(181, 86, 43, 0.12);
}

button:not(:disabled):active {
  transform: scale(0.98);
}

::selection {
  background: #F0D9CB;
}
