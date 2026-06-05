import { ApiKeyPanel } from "../components/Chat/ApiKeyPanel";
import { ChatPanel } from "../components/Chat/ChatPanel";
import { AppShell } from "../components/Layout/AppShell";
import { PdfStatusPanel } from "../components/Pdf/PdfStatusPanel";
import { useEvaAssistant } from "../hooks/useEvaAssistant";

export function AssistantPage() {
  const assistant = useEvaAssistant();

  return (
    <AppShell>
      <div className="grid flex-1 gap-4 pb-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="grid content-start gap-4">
          <PdfStatusPanel state={assistant.indexState} />
          <ApiKeyPanel
            apiKey={assistant.conversation.apiKey}
            settings={assistant.conversation.settings}
            onApiKeyChange={assistant.updateApiKey}
            onProviderChange={assistant.updateProvider}
            onModelChange={assistant.updateModel}
          />
          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-400 backdrop-blur-xl">
            <p className="font-semibold text-slate-200">Mode local</p>
            <p className="mt-1">
              Sans cle API, EVA affiche les meilleurs extraits trouves. Avec une
              cle, il genere une reponse synthetique a partir de ces sources.
            </p>
          </section>
        </aside>
        <ChatPanel
          messages={assistant.conversation.messages}
          canAsk={assistant.canAsk}
          isGenerating={assistant.isGenerating}
          onSend={assistant.sendQuestion}
          onReset={assistant.resetConversation}
        />
      </div>
    </AppShell>
  );
}
