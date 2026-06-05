import { ChatPanel } from "../components/Chat/ChatPanel";
import { AppShell } from "../components/Layout/AppShell";
import { AssistantSettingsPanel } from "../components/Layout/AssistantSettingsPanel";
import { useEvaAssistant } from "../hooks/useEvaAssistant";

export function AssistantPage() {
  const assistant = useEvaAssistant();

  return (
    <AppShell>
      <div className="grid flex-1 gap-4 pb-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <AssistantSettingsPanel
          apiKey={assistant.conversation.apiKey}
          settings={assistant.conversation.settings}
          indexState={assistant.indexState}
          onApiKeyChange={assistant.updateApiKey}
          onProviderChange={assistant.updateProvider}
          onModelChange={assistant.updateModel}
        />
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
