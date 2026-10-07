# 토큰 자동화

`tokens` 브랜치의 루트 `tokens.json`을 push하면 GitHub Actions가 실행됩니다.
워크플로 파일도 먼저 `tokens` 브랜치에 커밋하고 push해야 합니다.
Actions 탭에서 `Generate and merge tokens`를 수동 실행할 수도 있습니다.

1. 최신 `main`을 병합한 후보를 만듭니다. 충돌하면 중단합니다.
2. `npm ci`로 잠금 파일에 맞춰 의존성을 설치합니다.
3. `npm run tokens:build`로 참조와 계산식을 해석하고 변수를 생성합니다.
4. 생성한 SCSS의 컴파일, JavaScript 모듈 로딩과 Vite 빌드가 성공하면 생성물을 커밋합니다.
5. 검증한 동일 커밋을 `tokens`와 `main`에 atomic push합니다. 브랜치가 동시에 변경되거나 push가 거부되면 둘 다 갱신하지 않습니다.

## 생성 파일

- `src/generated/_tokens.scss`: Style Dictionary의 SCSS 변수. `$light-colors-black`, `$dark-colors-black`처럼 테마 접두사가 붙습니다.
- `src/generated/tokens.js`: sd-transforms와 Style Dictionary로 해석하고 내보낸 기본 export 객체. CSS-in-JS에서 `tokens.light.colors.black`처럼 사용합니다.

`core + light + theme`, `core + dark + theme`를 각각 변환합니다.
`$value`/`$type` 형식은 그대로 사용하고, `@tokens-studio/sd-transforms`가 Tokens Studio 타입·계산식·단위를 변환합니다.
Style Dictionary가 참조를 해석하고 복합 토큰을 확장해 SCSS와 JavaScript를 생성합니다. 원본 JSON은 변경하지 않습니다.
생성 파일은 직접 수정하지 않습니다. 화면 스타일에는 자동 적용하지 않습니다.

## GitHub 설정

저장소에서 Actions를 활성화하고 `GITHUB_TOKEN`의 contents 쓰기를 허용해야 합니다.
브랜치 보호 또는 ruleset이 직접 push를 막으면 자동 병합은 실패합니다.
이 워크플로는 보호 규칙을 우회하지 않으므로, 사용 정책에 맞게 Actions 봇의 push가 허용되어야 합니다.
별도 PAT는 사용하지 않습니다. `tokens` 브랜치 전체가 병합되므로 토큰 자동화와 관련된 변경만 이 브랜치에 넣으세요.

Style Dictionary 5와 호환되는 sd-transforms 2를 사용하며, 실제 설치 버전은 잠금 파일로 고정합니다.
