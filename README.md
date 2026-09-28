# Senpi extension starter

Senpi 플러그인을 npm 패키지로 배포하기 위한 TypeScript 시작점입니다. 기본 확장은 세션 시작 알림, `starter_echo` 도구, `/starter` 명령을 등록합니다. `src/index.ts`의 기본 export가 Senpi 확장 팩토리이며 `package.json`의 `pi.extensions`가 컴파일된 진입점을 가리킵니다.

## 시작하기

```sh
bun install
bun run check
senpi -e .
```

`senpi -e .`는 현재 디렉터리의 패키지 매니페스트를 읽습니다. 실행 후 `/starter`로 명령을 확인하거나, 모델에 `starter_echo` 도구를 요청할 수 있습니다. 소스 수정 후에는 `bun run build`와 Senpi의 `/reload` 또는 재실행을 사용하세요.

새 플러그인으로 사용할 때에는 `package.json`의 `name`, `version`, `description`, `license`를 변경하고, `LICENSE`의 저작권 표기와 이 문서를 수정하세요. 패키지 이름은 npm에서 사용 가능한 고유 이름이어야 합니다. 도구와 명령의 `starter_*` 이름도 목적에 맞게 바꾸세요.

## API 모듈

`src/api/core.ts`가 Senpi의 공개 타입을 전부 재노출합니다. 따라서 별도 래퍼에 없는 새 API도 `PluginAPI` (`ExtensionAPI`)와 `PluginContext` (`ExtensionContext`)에서 즉시 사용할 수 있습니다. 기능별 모듈은 원본 타입에서 `Pick`하므로 메서드 시그니처와 이벤트 오버로드를 자체적으로 복제하지 않습니다.

| 모듈 | 포함하는 API |
| --- | --- |
| `api/events` | `on`의 모든 프로젝트 신뢰, 리소스, 세션, 에이전트, 모델, 도구, 입력 이벤트 |
| `api/tools` | 도구 등록/실행, 파일 정책, 동적 활성화, read classifier, `defineTool`과 타입 가드 |
| `api/commands` | 명령, 단축키, CLI 플래그 및 명령 전용 세션 제어 context |
| `api/ui` | 메시지/Markdown/엔트리 렌더러, 알림, 대화상자, 위젯, 편집기, 테마 |
| `api/session` | 세션 이름/엔트리/라벨, compaction, 설정, 시스템 프롬프트 |
| `api/models` | provider 등록, 모델/사고 수준 전환, 모델 registry |
| `api/messaging` | 에이전트 메시지, 확장 간 이벤트 버스 및 RPC |
| `api/resources` | MCP 서버 등록, 셸 명령 |
| `api/core` | Senpi에서 공개한 모든 타입과 전체 팩토리/context 타입 |

예를 들어 기능 파일에서 필요한 API 범위만 받을 수 있습니다.

```ts
import type { EventAPI, ToolAPI } from "senpi-extension-starter/api"

export function registerFeatures(pi: EventAPI & ToolAPI): void {
  pi.on("tool_call", (event, ctx) => {
    if (event.toolName === "starter_echo") ctx.ui.notify("Echo requested", "info")
  })
}
```

실제 이름을 변경했다면 위 import 경로에도 변경한 패키지 이름을 사용하세요. 확장 내부에서는 상대 경로 `./api/index.js`로도 가져올 수 있습니다. 타입 정의의 원본은 `@code-yeongyu/senpi`이며, `typebox`는 도구의 매개변수 스키마를 작성할 때 사용합니다. 둘 다 Senpi가 제공하는 런타임 패키지라 peer dependency로 선언했습니다. Senpi 버전을 올릴 때 peer의 최소 버전과 개발 의존성 버전을 함께 갱신하고 타입 검사를 다시 실행하세요.

## 배포

```sh
bun run check
npm pack --dry-run
npm publish --access public
senpi install npm:<패키지-이름>
```

`prepack`은 테스트, 타입 검사, 빌드를 실행하며, `files`는 npm 배포에 `dist/`, README, LICENSE만 포함합니다. npm 계정 로그인 및 패키지 이름 확보는 배포 전에 별도로 필요합니다. 로컬에서 패키지를 바로 설치하려면 `senpi install ./`을 사용할 수 있습니다. 프로젝트에서만 활성화하려면 `senpi install -l npm:<패키지-이름>`을 사용하세요.

Senpi 패키지 리소스는 `pi.extensions`에 선언한 `dist/index.js`에서 검색됩니다. `exports`의 `./api` 및 `./api/*`는 다른 플러그인에서 타입과 도우미 함수를 재사용할 때 사용합니다. 런타임 의존성을 추가한다면 `devDependencies`가 아닌 `dependencies`에 넣으세요. Senpi 설치는 프로덕션 의존성을 설치하므로 개발 전용 패키지는 실행 시 사용할 수 없습니다.

참고: 설치된 Senpi `2026.9.27`의 `docs/extensions.md`, `docs/packages.md`, `dist/core/extensions/types.d.ts`를 기준으로 구성했습니다. 문서에 남아 있는 이전 `@earendil-works/pi-coding-agent` 예시 대신 현재 npm 배포명 `@code-yeongyu/senpi`를 사용합니다.
