/**
 * Sauvegarde / chargement / export PDF de la fiche, gestion du portrait, et
 * génération d'un nom aléatoire. Charge la fiche en mode édition (`?edit=<id>`).
 */
export function useCharacterPersistence(form: Record<string, string>) {
  const route = useRoute()
  const router = useRouter()

  // Mode édition si ?edit=ID est présent
  const editId = computed(() => route.query.edit ? Number(route.query.edit) : null)

  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const savedSuccess = ref(false)
  const portraitDataUrl = ref<string | null>(null)

  const { generateName } = useRandomName()
  function generateRandomName() {
    form['Nom'] = generateName()
  }

  function handlePortraitFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const maxW = 400, maxH = 400
        let w = img.width, h = img.height
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        portraitDataUrl.value = canvas.toDataURL('image/jpeg', 0.85)
      }
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
  }

  async function persistForm(): Promise<number> {
    if (editId.value) {
      const res = await $fetch<{ id: number }>(`/api/investigateur/${editId.value}`, {
        method: 'PUT',
        body: form
      })
      return res.id
    } else {
      const res = await $fetch<{ id: number }>('/api/investigateur', {
        method: 'POST',
        body: form
      })
      return res.id
    }
  }

  async function saveCharacter() {
    error.value = null
    savedSuccess.value = false
    isSaving.value = true
    try {
      const id = await persistForm()
      savedSuccess.value = true
      if (!editId.value) {
        await router.replace(`/investigateur/creer?edit=${id}`)
      }
    } catch (e: unknown) {
      error.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
    } finally { isSaving.value = false }
  }

  async function generatePdf() {
    error.value = null
    savedSuccess.value = false
    isLoading.value = true
    try {
      // Sauvegarde d'abord
      const id = await persistForm()
      if (!editId.value) {
        await router.replace(`/investigateur/creer?edit=${id}`)
      }
      // Génération du PDF
      const { url } = await $fetch<{ url: string }>('/api/investigateur/generate-pdf', {
        method: 'POST',
        body: { ...form, portrait: portraitDataUrl.value ?? undefined }
      })
      window.open(url, '_blank')
    } catch (e: unknown) {
      error.value = `Erreur : ${e instanceof Error ? e.message : String(e)}`
    } finally { isLoading.value = false }
  }

  // Charge la fiche existante en mode édition
  onMounted(async () => {
    if (!editId.value) return
    try {
      const data = await $fetch<{ data: Record<string, string> }>(`/api/investigateur/${editId.value}`)
      Object.assign(form, data.data)
    } catch {
      error.value = 'Impossible de charger la fiche.'
    }
  })

  return {
    editId, isLoading, isSaving, error, savedSuccess, portraitDataUrl,
    handlePortraitFile, saveCharacter, generatePdf, generateRandomName
  }
}
