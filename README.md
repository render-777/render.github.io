# Project Menu 1.0.0

로그인 없이 요리 레시피를 사진과 함께 등록하고 검색할 수 있는 귀여운 레시피 웹 페이지입니다.

## 실행

```bash
docker compose up --build
```

브라우저에서 `http://localhost:5000`으로 접속합니다.

## 기능

- 레시피 이름, 한 줄 소개, 인분, 시간, 난이도, 재료, 조리 순서 등록
- JPG, PNG, WebP 사진 업로드
- 메뉴명, 설명, 재료, 조리 순서 통합 검색
- 갈비찜, 김치찜, 제육볶음 기본 레시피와 이미지 포함

## 데이터

- 등록 데이터: `data/recipes.json`
- 업로드 사진: `data/uploads/`

`docker-compose.yml`에서 `./data:/app/data` 볼륨을 사용하므로 컨테이너를 다시 만들어도 등록한 레시피가 유지됩니다.
