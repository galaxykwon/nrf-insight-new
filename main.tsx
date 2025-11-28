import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // 우리가 열심히 만든 App.tsx를 불러옵니다
import './index.css' // 혹시 css 파일이 있다면

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
