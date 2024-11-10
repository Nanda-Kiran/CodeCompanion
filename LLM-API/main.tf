provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_cloud_run_service" "flask_api" {
  name     = "flask-api"
  location = var.region

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/promising-rock-441323-e2/hackumass/llm-api:latest"
        ports {
          container_port = 8080
        }
        env {
          name  = "FLASK_ENV"
          value = "production"
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

output "cloud_run_url" {
  value = google_cloud_run_service.flask_api.status[0].url
}
resource "google_cloud_run_service_iam_member" "invoker" {
  service    = google_cloud_run_service.flask_api.name
  location   = google_cloud_run_service.flask_api.location
  role       = "roles/run.invoker"
  member     = "allUsers"  # This makes the service publicly accessible
}

