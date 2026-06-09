import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PageShell } from "./layout/PageShell";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { SynopsisPage } from "./pages/SynopsisPage";
import { ThesisPage } from "./pages/ThesisPage";
import { IrafXadlPage } from "./pages/IrafXadlPage";
import { IrafXadlAnimated } from "./pages/IrafXadlAnimated";
import { EcrvrMvelAnimated } from "./pages/EcrvrMvelAnimated";
import { EesqaDelmoaAnimated } from "./pages/EesqaDelmoaAnimated";
import { ThesisStory } from "./pages/ThesisStory";
import { Methodology } from "./pages/Methodology";
import { PaperDetail } from "./pages/PaperDetail";
import { Papers } from "./pages/Papers";
import { Publications } from "./pages/Publications";
import { ThesisIntegration } from "./pages/ThesisIntegration";
import { DemoPage } from "./pages/DemoPage";
import { DriAnimated } from "./pages/DriAnimated";

export default function App() {
  return (
    <BrowserRouter>
      <PageShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/methodology/iraf-xadl" element={<IrafXadlPage />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/papers/:paperId" element={<PaperDetail />} />
          <Route path="/papers/iraf-xadl/animated" element={<IrafXadlAnimated />} />
          <Route path="/papers/paper-2/animated" element={<EcrvrMvelAnimated />} />
          <Route path="/papers/paper-3/animated" element={<EesqaDelmoaAnimated />} />
          <Route path="/thesis-story" element={<ThesisStory />} />
          <Route path="/thesis-integration" element={<ThesisIntegration />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/about" element={<About />} />
          <Route path="/synopsis" element={<SynopsisPage />} />
          <Route path="/thesis" element={<ThesisPage />} />
          {/* Demo hub — tabs handled inside DemoPage */}
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/demo/samples" element={<DemoPage />} />
          <Route path="/demo/experiments" element={<DemoPage />} />
          <Route path="/demo/dri" element={<DemoPage />} />
          <Route path="/papers/paper-4/animated" element={<DriAnimated />} />
        </Routes>
      </PageShell>
    </BrowserRouter>
  );
}
