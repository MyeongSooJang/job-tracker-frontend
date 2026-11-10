// Crepe가 영어로 내보내는 메뉴·툴바 문구를 한글로 바꾼다. 아이콘은 건드리지 않아 label만 넘긴다.
export const BLOCK_EDIT_KO = {
  textGroup: {
    label: '텍스트',
    text: { label: '본문' },
    h1: { label: '제목 1' },
    h2: { label: '제목 2' },
    h3: { label: '제목 3' },
    h4: { label: '제목 4' },
    h5: { label: '제목 5' },
    h6: { label: '제목 6' },
    quote: { label: '인용' },
    divider: { label: '구분선' },
  },
  listGroup: {
    label: '목록',
    bulletList: { label: '글머리 기호 목록' },
    orderedList: { label: '번호 목록' },
    taskList: { label: '할 일 목록' },
  },
  advancedGroup: {
    label: '고급',
    image: { label: '이미지' },
    codeBlock: { label: '코드 블록' },
    table: { label: '표' },
  },
}

export const TOOLBAR_KO = {
  boldLabel: '굵게',
  italicLabel: '기울임',
  strikethroughLabel: '취소선',
  codeLabel: '코드',
  linkLabel: '링크',
}

export const LINK_TOOLTIP_KO = {
  inputPlaceholder: '링크 주소를 붙여넣으세요',
}

export const IMAGE_BLOCK_KO = {
  inlineUploadButton: '업로드',
  inlineConfirmButton: '확인',
  inlineUploadPlaceholderText: '또는 링크 붙여넣기',
  blockUploadButton: '이미지 업로드',
  blockConfirmButton: '확인',
  blockUploadPlaceholderText: '또는 링크 붙여넣기',
  blockCaptionPlaceholderText: '설명 입력',
}
