package entities

import (
	"time"

	"github.com/google/uuid"
)

type TestimonialStatus string

const (
	TestimonialPublished TestimonialStatus = "published"
	TestimonialHidden    TestimonialStatus = "hidden"
)

type Testimonial struct {
	ID         uuid.UUID         `db:"id" json:"id"`
	AuthorName string            `db:"author_name" json:"author_name"`
	ClinicName *string           `db:"clinic_name" json:"clinic_name,omitempty"`
	Content    string            `db:"content" json:"content"`
	Rating     int               `db:"rating" json:"rating"` // Giới hạn từ 1 đến 5
	Status     TestimonialStatus `db:"status" json:"status"`
	CreatedAt  time.Time         `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time         `db:"updated_at" json:"updated_at"`
}
