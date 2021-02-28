async function loadComponent(scope, module) {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default')
  const container = window[scope] // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default)
  const factory = await window[scope].get(module)
  const Module = factory()
  return Module
}

export default async ({ url, scope, module }) => {
  await new Promise((resolve, reject) => {
    const element = document.createElement('script')

    element.src = url
    element.type = 'text/javascript'
    element.async = true

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${url}`)
      resolve()
      document.head.removeChild(element)
    }

    element.onerror = e => {
      console.error(`Dynamic Script Error: ${url}`)
      document.head.removeChild(element)
      reject(e)
    }

    document.head.appendChild(element)
  })

  return loadComponent(scope, module)
}
