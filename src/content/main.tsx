import React from 'react';
import ReactDOM from 'react-dom/client';
import "../App/home/home.scss";

console.log("hallo world");
function App() {
	return (
		<h1>Hello World</h1>
	)
}

const root = ReactDOM.createRoot(document.getElementsByClassName("l-contents_wrapper")[0]);
root.render(<App />);

export {};