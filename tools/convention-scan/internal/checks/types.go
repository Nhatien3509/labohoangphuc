package checks

type Severity string

const (
	SeverityCritical Severity = "CRITICAL"
	SeverityWarning  Severity = "WARNING"
)

type Violation struct {
	Section   string
	SectionID string
	Severity  Severity
	File      string
	Line      int
	Function  string
	Message   string
	Hint      string
}

type Result struct {
	Violations []Violation
	FilesCount int
}

func (r *Result) Add(v Violation) {
	r.Violations = append(r.Violations, v)
}

func (r *Result) HasCritical() bool {
	for _, v := range r.Violations {
		if v.Severity == SeverityCritical {
			return true
		}
	}
	return false
}

func (r *Result) CountBySeverity(s Severity) int {
	n := 0
	for _, v := range r.Violations {
		if v.Severity == s {
			n++
		}
	}
	return n
}

func (r *Result) CountBySection() map[string]int {
	m := map[string]int{}
	for _, v := range r.Violations {
		m[v.SectionID]++
	}
	return m
}
