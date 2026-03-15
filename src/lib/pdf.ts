// Helpers para exportação de roteiros em PDF via pdf-lib
// Implementação completa no Módulo 11 (Exportador de PDF)

export type ScriptExportData = {
  seriesTitle: string
  episodeOrder: number
  episodeTitle: string
  script: string
  exportedAt?: Date
}

// Stub — será implementado no Módulo 11
export async function generateScriptPdf(_data: ScriptExportData): Promise<Uint8Array> {
  throw new Error('Exportador de PDF ainda não implementado. Aguarde o Módulo 11.')
}
