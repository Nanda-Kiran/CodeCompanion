variable "project_id" {
  type = string
  default = "promising-rock-441323-e2"
}

variable "region" {
  type = string
  default = "us-central1"
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}
