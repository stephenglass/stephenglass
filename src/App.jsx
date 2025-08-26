import Cat from "./components/Cat/Cat.jsx";
import Card from "./components/Card/Card.jsx";

export default function App() {
  return (
    <div class="mx-auto mt-10 max-w-xl rounded-2xl bg-white p-8 shadow-lg">
      <header class="mb-8">
        <span class="flex items-center">
          <h1>Stephen Glass</h1>
          <Cat />
        </span>
        <p class="mt-1 text-lg text-gray-500">Welcome to my personal landing page</p>
      </header>
      <section class="flex flex-col gap-4">
        <Card
          href="https://github.com/stephenglass"
          icon={
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.17-1.1-1.48-1.1-1.48-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.38-2.03 1-2.75-.1-.26-.44-1.3.09-2.7 0 0 .83-.27 2.73 1.05a9.18 9.18 0 0 1 2.49-.34c.85 0 1.71.12 2.49.34 1.9-1.32 2.73-1.05 2.73-1.05.53 1.4.19 2.44.09 2.7.62.72 1 1.63 1 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"
                fill="#333"
              />
            </svg>
          }
          title="GitHub"
          desc="View my projects and open-source contributions."
        />
        <Card
          href="https://linkedin.com/in/stephenglass"
          icon={
            <svg
              width="32"
              height="32"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#0A66C2"
                d="M12.225 12.225h-1.778V9.44c0-.664-.012-1.519-.925-1.519-.926 0-1.068.724-1.068 1.47v2.834H6.676V6.498h1.707v.783h.024c.348-.594.996-.95 1.684-.925 1.802 0 2.135 1.185 2.135 2.728l-.001 3.14zM4.67 5.715a1.037 1.037 0 01-1.032-1.031c0-.566.466-1.032 1.032-1.032.566 0 1.031.466 1.032 1.032 0 .566-.466 1.032-1.032 1.032zm.889 6.51h-1.78V6.498h1.78v5.727zM13.11 2H2.885A.88.88 0 002 2.866v10.268a.88.88 0 00.885.866h10.226a.882.882 0 00.889-.866V2.865a.88.88 0 00-.889-.864z"
              />
            </svg>
          }
          title="LinkedIn"
          desc="Connect with me professionally."
        />
        <Card
          href="mailto:stephen@example.com"
          icon={
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="4" width="20" height="16" rx="4" fill="#d44638" />
              <path
                d="M4 6l8 7 8-7"
                stroke="#fff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
          title="Email"
          desc="Send me an email."
        />
      </section>
    </div>
  );
}
