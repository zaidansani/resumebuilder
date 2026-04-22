let initialized = false

async function ensureInit() {
  if (initialized) return
  initialized = true

  const mod = await import("@myriaddreamin/typst.react")
  const { $typst } = await import("@myriaddreamin/typst.ts")

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

  mod.TypstDocument.setWasmModuleInitOptions({
    beforeBuild: [],
    getModule: () =>
      fetch(`${base}/typst/typst_ts_renderer_bg.wasm`).then((r) => WebAssembly.compileStreaming(r)),
  })

  $typst.setCompilerInitOptions({
    getModule: () =>
      fetch(`${base}/typst/typst_ts_web_compiler_bg.wasm`).then((r) =>
        WebAssembly.compileStreaming(r)
      ),
  })
}

export async function compileTypst(source: string): Promise<Uint8Array> {
  await ensureInit()
  const { $typst } = await import("@myriaddreamin/typst.ts")
  const result = await $typst.vector({ mainContent: source })
  if (!result) throw new Error("Compilation returned empty result")
  return result
}

export async function compileTypstPdf(source: string): Promise<Uint8Array> {
  await ensureInit()
  const { $typst } = await import("@myriaddreamin/typst.ts")
  const result = await $typst.pdf({ mainContent: source })
  if (!result) throw new Error("PDF compilation returned empty result")
  return result
}

export function downloadBlob(data: Uint8Array, filename: string, mimeType: string) {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export interface TemplateConfig {
  globalUrl: string
  /** Ordered list of { sectionKey, url } — rendered top to bottom */
  sections: { key: string; url: string }[]
}

async function fetchText(url: string): Promise<string> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`)
  return r.text()
}

async function buildTemplateSource(data: unknown, config: TemplateConfig): Promise<string> {
  const [globalSrc, ...sectionSrcs] = await Promise.all([
    fetchText(config.globalUrl),
    ...config.sections.map((s) => fetchText(s.url)),
  ])
  const preamble = `#let data = json.decode(${JSON.stringify(JSON.stringify(data))})\n`
  return [preamble, globalSrc, ...sectionSrcs].join("\n")
}

export async function compileWithTemplate(
  data: unknown,
  config: TemplateConfig
): Promise<Uint8Array> {
  return compileTypst(await buildTemplateSource(data, config))
}

export async function compileWithTemplatePdf(
  data: unknown,
  config: TemplateConfig
): Promise<Uint8Array> {
  return compileTypstPdf(await buildTemplateSource(data, config))
}
