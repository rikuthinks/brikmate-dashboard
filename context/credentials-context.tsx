import { createContext, useContext, useReducer } from "react"

const CredentialsContext = createContext(null)
const CredentialsDispatchContext = createContext(null)

export function CredentialsProvider({ children }) {
  const [credentials, dispatch] = useReducer(
    credentialsReducer,
    initialCredentials
  )

  return (
    <CredentialsContext.Provider value={credentials}>
      <CredentialsDispatchContext.Provider value={dispatch}>
        {children}
      </CredentialsDispatchContext.Provider>
    </CredentialsContext.Provider>
  )
}

export function useCredentials() {
  return useContext(CredentialsContext)
}

export function useCredentialsDispatch() {
  return useContext(CredentialsDispatchContext)
}

function credentialsReducer(credentials, action) {
  switch (action.type) {
    case "added-openai-api-key": {
      return {
        ...credentials,
        openaiApiKey: action.openaiApiKey,
      }
    }
    case "added-pinecone-api-key": {
      return {
        ...credentials,
        pineconeApiKey: action.pineconeApiKey,
      }
    }
    default: {
      throw Error("Unknown action: " + action.type)
    }
  }
}

const initialCredentials = {
  openaiApiKey: "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",
  pineconeApiKey: "82a90069-81bb-4cf1-bda3-d752237bd5cb",
}
