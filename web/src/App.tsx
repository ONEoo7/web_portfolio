import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup, useChatContext } from "@copilotkit/react-ui";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function ButtonWithLabel() {
  const { open, setOpen, icons } = useChatContext() as any;
  return (
    <div
      className={`chat-launcher ${open ? "open" : ""}`}
      onClick={() => setOpen(!open)}
    >
      <button
        className={`copilotKitButton ${open ? "open" : ""}`}
        aria-label={open ? "Close Chat" : "Open Chat"}
      >
        <div className="copilotKitButtonIcon copilotKitButtonIconOpen">
          {icons.openIcon}
        </div>
        <div className="copilotKitButtonIcon copilotKitButtonIconClose">
          {icons.closeIcon}
        </div>
      </button>
      <span className="chat-launcher-label">Ask me about Stefan</span>
    </div>
  );
}

export default function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <Header />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <CopilotPopup
        defaultOpen={false}
        clickOutsideToClose={false}
        labels={{
          title: "Ask about Stefan",
          initial:
            "Hi! Ask me anything about Stefan's experience, projects, or skills.",
        }}
        instructions="You are Stefan Ghitescu's portfolio assistant. Answer concisely and only from the retrieved context. If the answer isn't in the context, say you don't have that information."
        Button={ButtonWithLabel}
      />
    </CopilotKit>
  );
}
