/** État de la connexion (toujours « en ligne » côté serveur et avant montage). */
export function useNetworkStatus() {
  const online = useState('network-online', () => true)

  onMounted(() => {
    const update = () => {
      online.value = navigator.onLine
    }
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    onBeforeUnmount(() => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    })
  })

  return { online }
}
