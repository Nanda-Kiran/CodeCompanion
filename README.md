# CodeCompanion

An AI helper for coding-interview practice. You pick a problem and write a solution in the browser. Gemini can give you a hint, answer questions about your code, and check your solution. The model judges the solution; no test cases are run.

Built over a weekend at HackUMass (November 2024) by two contributors (see Team).

## What it does

- **Problem bank:** 1,300 problems, loaded from a MongoDB dump (`hackumass/questions.bson`). Browse the list, search by name, and filter by Easy, Medium or Hard. The dump also has Basic and School problems, which appear only under "All".
- **In-browser editor:** a Monaco editor. Python runs client-side through Pyodide, loaded from the jsDelivr CDN. In the problem workspace you can select C++ or Java, but neither runs. The standalone editor page runs Python or JavaScript; for JavaScript it shows the code's return value.
- **Hints:** `POST /api/generate-hint` sends the problem, your code and a hint level to Gemini. Levels run from 1 to 3: a nudge, an approach, then a near-solution. The prompt tells the model not to give away the full answer. The UI always requests level 1.
- **Ask the companion:** `POST /api/answer-question` answers free-form questions using the problem statement and your current code.
- **Solution check:** `POST /api/validate-code` asks Gemini whether your code solves the problem. It returns `accepted`, or `failed` with the model's explanation. No test cases are run. The problem workspace calls it every time you click Run Code.
- **Sign-in:** Firebase email/password registration and login.

## Architecture

```
React app (Monaco, Pyodide, Firebase Auth)
  |-- GET  /api/questions ...      -> Spring Boot service (hackumass/)  -> MongoDB
  '-- POST /api/generate-hint ...  -> Flask LLM service (LLM-API/)      -> Gemini (gemini-1.5-flash)
                                      deployed to Google Cloud Run with Terraform
```

| Path | Contents | Stack |
|---|---|---|
| `LLM-API/` | `PromptAPI.py`: the hint, Q&A and validation endpoints. Dockerfile. Cloud Run Terraform (`main.tf`, `variables.tf`). `QuestionAPI.py` is an earlier single-endpoint version, and `ValidateAPI.py` is empty | Python, Flask, google-generativeai, Docker, Terraform |
| `hackumass/` | Question API: `GET /api/questions`, `/api/questions/{difficulty}`, `/api/questions/search?name=`. `questions.bson` is a mongodump of the problem set. Dockerfile | Java 17, Spring Boot 3.3, Spring Data MongoDB |
| `Frontend_HackUMass/pair-programming-app/` | Login, dashboard, problem list, problem workspace, standalone editor. The problem list fetches every question and filters in the browser | React 18, Monaco, Pyodide, Firebase Auth, Nginx (Docker) |
| `docker-compose.yml` | Builds and runs the question service and the frontend | Docker Compose |

## Running it

You need your own Gemini API key, MongoDB database and Firebase project, with the Email/Password sign-in provider enabled. The code reads credentials from environment variables; none are stored in the repo:

| Variable | Used by |
|---|---|
| `GEMINI_API_KEY` | LLM service (`LLM-API/PromptAPI.py`) |
| `MONGODB_URI` | Question service (`application.properties`). End the URI with `/hackumass` to match the restore command below. |
| `REACT_APP_FIREBASE_API_KEY` | Frontend (`src/firebase.js`), read at build time. Set `authDomain`, `projectId` and the rest of `firebaseConfig` to your own project. |

Docker Compose reads `MONGODB_URI` and `REACT_APP_FIREBASE_API_KEY` from your shell or from a `.env` file in the repo root, which `.gitignore` excludes.

Load the problem set. This needs the MongoDB Database Tools:

```bash
mongorestore --uri "<your-mongodb-uri>" -d hackumass -c questions hackumass/questions.bson
```

### LLM service

The Dockerfile uses Python 3.9.

```bash
cd LLM-API
pip install -r requirements.txt
export GEMINI_API_KEY=<your-key>
python PromptAPI.py            # serves on :8080
```

`PromptAPI.py` pins `gemini-1.5-flash`. If your key cannot use that model, change the model name in the three `genai.GenerativeModel(...)` calls.

To deploy to Cloud Run:

1. Build an image from `LLM-API/Dockerfile` and push it to Artifact Registry.
2. Set the `image` path in `LLM-API/main.tf` to your image.
3. Run:

```bash
cd LLM-API
terraform init
terraform apply -var project_id=<your-gcp-project> -var gemini_api_key=<your-key>
```

Terraform passes the key to the service as `GEMINI_API_KEY`. Terraform prints the service URL as `cloud_run_url`. `main.tf` grants `roles/run.invoker` to `allUsers`, so the deployed service is public.

### Question service and frontend

```bash
docker compose up --build      # question service on :8080, frontend on :4000
```

Compose does not start MongoDB or the LLM service. It passes `MONGODB_URI` to the question service at run time and `REACT_APP_FIREBASE_API_KEY` to the frontend build.

You can also run the two services separately, each in its own terminal. Use Java 17 and Node 18, as the Dockerfiles do.

```bash
cd hackumass && MONGODB_URI=<your-mongodb-uri> ./mvnw spring-boot:run
```

```bash
cd Frontend_HackUMass/pair-programming-app && npm install && REACT_APP_FIREBASE_API_KEY=<your-key> npm start   # :3000
```

### Service URLs

The frontend hardcodes its service URLs in `Frontend_HackUMass/pair-programming-app/src/components/`:

- **Question service:** `http://localhost:8080`, in `QuestionList/QuestionList.js`.
- **LLM service:** the team's Cloud Run URL, used three times in `QuestionDetail/QuestionDetail.js`. Replace it with your own Cloud Run URL or a local address.

The Flask service and the question service both listen on 8080, and the frontend expects the question service there. To run the LLM service locally alongside it, change the port in the `app.run(...)` line of `PromptAPI.py`. Then point the three URLs in `QuestionDetail.js` at the new port.

## Status

Hackathon prototype, last updated in November 2024 and not maintained. Known gaps:

- The LLM judges solution checks. Nothing runs them against test cases.
- `validate-code` marks a solution `accepted` whenever the model's reply contains the word "accepted", even a reply like "not accepted".
- The UI always requests hint level 1.
- Pages after login are not auth-guarded.
- A problem page works only when opened from the list, because the problem is passed through router state. A direct link does not load it.
- Service URLs and model names are hardcoded in source files instead of being read from environment variables.

## Team

Contributions as recorded in the commit history:

- Nanda Kiran Velaga ([@Nanda-Kiran](https://github.com/Nanda-Kiran)): the Flask LLM service and its prompts, its Dockerfile, and the Terraform deployment to Cloud Run
- Venkata Revanth ([@Revanth1122](https://github.com/Revanth1122)): the React frontend, the Spring Boot question service, and the Docker Compose setup
