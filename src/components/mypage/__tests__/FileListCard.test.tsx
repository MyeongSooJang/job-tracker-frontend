import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadFile } from '@/api/profile'
import type { UserFile } from '@/api/types'
import FileListCard from '../FileListCard'

const uploadMutate = vi.fn()
const deleteMutate = vi.fn()
let uploadError: unknown = null
let deleteError: unknown = null

vi.mock('@/hooks/useProfile', () => ({
  useUploadFile: () => ({ mutate: uploadMutate, isPending: false, error: uploadError, reset: vi.fn() }),
  useDeleteFile: () => ({ mutate: deleteMutate, isPending: false, error: deleteError, reset: vi.fn() }),
}))

vi.mock('@/api/profile', () => ({ downloadFile: vi.fn() }))

const files: UserFile[] = [
  { id: 3, type: 'PORTFOLIO', fileName: '<b>포트폴리오</b>.pdf', sizeBytes: 4096, createdAt: '2026-11-03T09:30:00' },
  { id: 2, type: 'RESUME', fileName: '이력서_v2.pdf', sizeBytes: 2048, createdAt: '2026-11-02T10:00:00' },
  { id: 1, type: 'RESUME', fileName: '이력서_v1.pdf', sizeBytes: 1024, createdAt: '2026-11-01T10:00:00' },
]

const apiError = (status: number, code: string, message: string) =>
  Object.assign(new Error('x'), { isAxiosError: true, response: { status, data: { code, message } } })

const chooseType = (user: ReturnType<typeof userEvent.setup>, label: string) =>
  user.selectOptions(screen.getByLabelText('파일 종류'), label)

const chooseFile = (file: File) =>
  fireEvent.change(screen.getByLabelText('파일 선택'), { target: { files: [file] } })

const pdf = (name = 'a.pdf') => new File(['%PDF-1.7'], name, { type: 'application/pdf' })

describe('FileListCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadError = null
    deleteError = null
  })
  afterEach(() => vi.restoreAllMocks())

  it('파일이 없으면 빈 목록 안내를 보여준다', () => {
    render(<FileListCard files={[]} />)

    expect(screen.getByText('등록된 파일이 없습니다.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('서버가 준 순서 그대로 파일명, 종류, 크기, 업로드 시각을 보여준다', () => {
    render(<FileListCard files={files} />)

    const items = screen.getAllByRole('listitem')
    expect(items.map(item => item.querySelector('[data-testid="file-name"]')?.textContent)).toEqual([
      '<b>포트폴리오</b>.pdf', '이력서_v2.pdf', '이력서_v1.pdf',
    ])
    expect(within(items[0]).getByText('포트폴리오')).toBeInTheDocument()
    expect(items[0]).toHaveTextContent('4.0KB · 2026.11.03 09:30 업로드')
    expect(within(items[1]).getByText('이력서')).toBeInTheDocument()
  })

  it('파일명은 HTML이 아니라 텍스트로 보여준다', () => {
    const { container } = render(<FileListCard files={files} />)

    expect(container.querySelector('b')).toBeNull()
  })

  it('같은 종류가 여러 개여도 모두 보여주고 교체 버튼은 없다', () => {
    render(<FileListCard files={files} />)

    expect(screen.getByText('이력서_v1.pdf')).toBeInTheDocument()
    expect(screen.getByText('이력서_v2.pdf')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /교체/ })).not.toBeInTheDocument()
  })

  it('종류를 고르지 않으면 파일 선택 버튼이 비활성화된다', () => {
    render(<FileListCard files={[]} />)

    expect(screen.getByRole('button', { name: '파일 선택' })).toBeDisabled()
  })

  it('종류 없이 파일이 들어오면(끌어다 놓기 등) 업로드하지 않고 안내한다', () => {
    render(<FileListCard files={[]} />)

    chooseFile(pdf())

    expect(screen.getByRole('alert')).toHaveTextContent('파일 종류를 먼저 선택해 주세요.')
    expect(uploadMutate).not.toHaveBeenCalled()
  })

  it('종류를 고르고 PDF를 선택하면 종류와 함께 업로드를 요청한다', async () => {
    const user = userEvent.setup()
    render(<FileListCard files={[]} />)
    const file = pdf()

    await chooseType(user, '포트폴리오')
    chooseFile(file)

    expect(uploadMutate).toHaveBeenCalledWith({ file, type: 'PORTFOLIO' })
  })

  it('끌어다 놓은 PDF도 선택한 종류로 업로드한다', async () => {
    const user = userEvent.setup()
    render(<FileListCard files={[]} />)
    const file = pdf('drop.pdf')

    await chooseType(user, '자격증')
    fireEvent.drop(screen.getByText('PDF 파일을 여기로 끌어다 놓으세요'), { dataTransfer: { files: [file] } })

    expect(uploadMutate).toHaveBeenCalledWith({ file, type: 'CERTIFICATE' })
  })

  it('PDF가 아니거나 5MB를 넘는 파일은 요청 없이 안내한다', async () => {
    const user = userEvent.setup()
    render(<FileListCard files={[]} />)
    await chooseType(user, '기타')

    chooseFile(new File(['x'], 'a.docx', { type: 'application/msword' }))
    expect(screen.getByRole('alert')).toHaveTextContent('PDF 파일만 업로드할 수 있습니다.')

    chooseFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.pdf', { type: 'application/pdf' }))
    expect(screen.getByRole('alert')).toHaveTextContent('파일 크기는 5MB 이하여야 합니다.')
    expect(uploadMutate).not.toHaveBeenCalled()
  })

  it('업로드 실패 시 에러 코드에 맞는 안내를 보여준다', () => {
    uploadError = apiError(400, 'FILE_LIMIT_EXCEEDED', '더 이상 저장할 수 없습니다.')
    render(<FileListCard files={files} />)

    expect(screen.getByRole('alert')).toHaveTextContent('더 이상 저장할 수 없습니다. 기존 파일을 지운 뒤 다시 올려 주세요.')
  })

  it('삭제를 확인하면 해당 파일 id로 삭제를 요청하고, 취소하면 요청하지 않는다', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm')
    render(<FileListCard files={files} />)

    confirm.mockReturnValueOnce(false)
    await user.click(screen.getByRole('button', { name: '이력서_v2.pdf 삭제' }))
    expect(deleteMutate).not.toHaveBeenCalled()

    confirm.mockReturnValueOnce(true)
    await user.click(screen.getByRole('button', { name: '이력서_v2.pdf 삭제' }))
    expect(deleteMutate).toHaveBeenCalledWith(2)
  })

  it('삭제 실패 시 서버 메시지를 보여준다', () => {
    deleteError = apiError(404, 'FILE_NOT_FOUND', '이미 삭제된 파일입니다.')
    render(<FileListCard files={files} />)

    expect(screen.getByRole('alert')).toHaveTextContent('이미 삭제된 파일입니다.')
  })

  it('내려받기는 클릭할 때 해당 id로 요청하고 원래 파일명으로 저장한다', async () => {
    const user = userEvent.setup()
    vi.mocked(downloadFile).mockResolvedValue(new Blob(['%PDF-1.7']))
    URL.createObjectURL = vi.fn(() => 'blob:file')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<FileListCard files={files} />)
    expect(downloadFile).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '이력서_v1.pdf 내려받기' }))

    await waitFor(() => expect(click).toHaveBeenCalledTimes(1))
    expect(downloadFile).toHaveBeenCalledWith(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:file')
  })

  it('내려받기에 실패하면 오류를 안내한다', async () => {
    const user = userEvent.setup()
    vi.mocked(downloadFile).mockRejectedValue(new Error('network'))
    render(<FileListCard files={files} />)

    await user.click(screen.getByRole('button', { name: '이력서_v1.pdf 내려받기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('파일을 내려받지 못했습니다.')
  })

  it('미리보기 버튼을 누르면 미리보기 창이 열린다', async () => {
    const user = userEvent.setup()
    vi.mocked(downloadFile).mockReturnValue(new Promise(() => {}))
    render(<FileListCard files={files} />)

    await user.click(screen.getByRole('button', { name: '이력서_v2.pdf 미리보기' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(downloadFile).toHaveBeenCalledWith(2)
  })
})
