import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'

// ======================================================
// CATEGORY DATA
// ======================================================

import collegeData from './data/college/questions.json'
import schoolData from './data/school/questions.json'
import school2Data from './data/school-2/questions.json'

// ======================================================
// CATEGORIES
// ======================================================

const categories = [
  {
    id: 'college',
    name: 'কলেজ পর্যায়',
    data: collegeData,
  },
  {
    id: 'school',
    name: 'স্কুল পর্যায়',
    data: schoolData,
  },
  {
    id: 'school-2',
    name: 'স্কুল পর্যায় ২',
    data: school2Data,
  },
]

const NEGATIVE_MARK = 0.25

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function subjectForQuestion(subjects, id) {
  return subjects.find(
    (s) =>
      id >= s.range[0] &&
      id <= s.range[1]
  )
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60

  return `${String(m).padStart(2, '0')}:${String(
    s
  ).padStart(2, '0')}`
}

// ======================================================
// GET EXAMS
// ======================================================

function getExams(data) {
  if (Array.isArray(data?.exams)) {
    return data.exams
  }

  if (data) {
    return [data]
  }

  return []
}

// ======================================================
// MAIN APP
// ======================================================

export default function App() {
  // ====================================================
  // CATEGORY
  // ====================================================

  const [categoryId, setCategoryId] =
    useState('school')

  const currentCategory =
    categories.find(
      (category) =>
        category.id === categoryId
    ) || categories[0]

  // Current category-এর সব exam
  const exams = getExams(
    currentCategory.data
  )

  // ====================================================
  // EXAM
  // ====================================================

  const [examId, setExamId] = useState(
    exams[0]?.id
  )

  const currentExam =
    exams.find(
      (exam) => exam.id === examId
    ) || exams[0]

  const questions =
    currentExam?.questions || []

  const subjects =
    currentExam?.subjects || []

  const durationMinutes =
    currentExam?.durationMinutes || 60

  // ====================================================
  // STATES
  // ====================================================

  const [visibleId, setVisibleId] =
    useState(
      questions[0]?.id
    )

  const [answers, setAnswers] =
    useState({})

  const [marked, setMarked] =
    useState({})

  const [submitted, setSubmitted] =
    useState(false)

  const [examOver, setExamOver] =
    useState(false)

  const [examStarted, setExamStarted] =
    useState(false)

  const [secondsLeft, setSecondsLeft] =
    useState(
      durationMinutes * 60
    )

  // ====================================================
  // REFS
  // ====================================================

  const timerRef =
    useRef(null)

  const questionRefs =
    useRef({})

  const listRef =
    useRef(null)

  // ====================================================
  // START EXAM
  // ====================================================

  function startExam() {
    if (submitted || examOver) {
      return
    }

    setExamStarted(true)
  }

  // ====================================================
  // CHANGE CATEGORY
  // ====================================================

  function changeCategory(
    nextCategoryId
  ) {
    clearInterval(
      timerRef.current
    )

    const nextCategory =
      categories.find(
        (category) =>
          category.id ===
          nextCategoryId
      )

    if (!nextCategory) {
      return
    }

    const nextExams =
      getExams(
        nextCategory.data
      )

    const nextExam =
      nextExams[0]

    // Category change
    setCategoryId(
      nextCategoryId
    )

    // নতুন category-এর প্রথম exam
    setExamId(
      nextExam?.id
    )

    // Reset answers
    setAnswers({})

    // Reset marks
    setMarked({})

    // Reset submitted
    setSubmitted(false)

    // Reset exam over
    setExamOver(false)

    // আবার Start করতে হবে
    setExamStarted(false)

    // প্রথম question
    setVisibleId(
      nextExam?.questions?.[0]?.id
    )

    // Timer reset
    setSecondsLeft(
      (nextExam?.durationMinutes ||
        60) * 60
    )

    // Question refs reset
    questionRefs.current = {}

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    })
  }

  // ====================================================
  // CHANGE EXAM
  // ====================================================

  function changeExam(
    nextExamId
  ) {
    clearInterval(
      timerRef.current
    )

    const nextExam =
      exams.find(
        (exam) =>
          exam.id ===
          nextExamId
      )

    if (!nextExam) {
      return
    }

    setExamId(
      nextExamId
    )

    setAnswers({})

    setMarked({})

    setSubmitted(false)

    setExamOver(false)

    // Exam change করলে Start button
    setExamStarted(false)

    setVisibleId(
      nextExam.questions?.[0]?.id
    )

    setSecondsLeft(
      (nextExam.durationMinutes ||
        60) * 60
    )

    questionRefs.current = {}

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    })
  }

  // ====================================================
  // TIMER
  // ====================================================

  useEffect(() => {
    if (
      !examStarted ||
      submitted ||
      examOver ||
      !currentExam
    ) {
      return
    }

    timerRef.current =
      setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(
              timerRef.current
            )

            setSubmitted(true)

            setExamOver(true)

            return 0
          }

          return s - 1
        })
      }, 1000)

    return () =>
      clearInterval(
        timerRef.current
      )
  }, [
    examStarted,
    submitted,
    examOver,
    examId,
    categoryId,
  ])

  // ====================================================
  // SCROLL SPY
  // ====================================================

  useEffect(() => {
    if (submitted) {
      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                const id =
                  Number(
                    entry.target
                      .dataset
                      .qid
                  )

                setVisibleId(id)
              }
            }
          )
        },
        {
          root: null,
          rootMargin:
            '-20% 0px -70% 0px',
          threshold: 0,
        }
      )

    Object.values(
      questionRefs.current
    ).forEach(
      (el) => {
        if (el) {
          observer.observe(el)
        }
      }
    )

    return () =>
      observer.disconnect()
  }, [
    submitted,
    examId,
    categoryId,
  ])

  // ====================================================
  // COUNTS
  // ====================================================

  const answeredCount =
    Object.keys(
      answers
    ).length

  const markedCount =
    Object.keys(
      marked
    ).length

  // ====================================================
  // SELECT OPTION
  // ====================================================

  const selectOption =
    useCallback(
      (qId, optionId) => {
        if (submitted) {
          return
        }

        if (!examStarted) {
          return
        }

        // Answer already selected
        if (
          answers[qId] !==
          undefined
        ) {
          return
        }

        setAnswers((prev) => ({
          ...prev,
          [qId]: optionId,
        }))
      },
      [
        answers,
        submitted,
        examStarted,
      ]
    )

  // ====================================================
  // MARK QUESTION
  // ====================================================

  function toggleMark(qId) {
    if (submitted) {
      return
    }

    if (!examStarted) {
      return
    }

    setMarked((prev) => {
      const next = {
        ...prev,
      }

      if (next[qId]) {
        delete next[qId]
      } else {
        next[qId] = true
      }

      return next
    })
  }

  // ====================================================
  // GO TO QUESTION
  // ====================================================

  function goTo(id) {
    const el =
      questionRefs.current[id]

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      setVisibleId(id)
    }
  }

  // ====================================================
  // SUBMIT
  // ====================================================

  function handleSubmit() {
    if (!examStarted) {
      return
    }

    clearInterval(
      timerRef.current
    )

    setSubmitted(true)

    setExamOver(true)
  }

  // ====================================================
  // RESTART
  // ====================================================

  function restart() {
    clearInterval(
      timerRef.current
    )

    setAnswers({})

    setMarked({})

    setSubmitted(false)

    setExamOver(false)

    // Start button আবার আসবে
    setExamStarted(false)

    setVisibleId(
      questions[0]?.id
    )

    setSecondsLeft(
      durationMinutes * 60
    )

    if (listRef.current) {
      listRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ====================================================
  // RESULTS
  // ====================================================

  const results =
    useMemo(() => {
      if (!submitted) {
        return null
      }

      const bySubject = {}

      subjects.forEach((s) => {
        bySubject[s.key] = {
          name: s.name,
          correct: 0,
          wrong: 0,
          total: 0,
        }
      })

      let correct = 0
      let wrong = 0
      let unanswered = 0
      let score = 0

      questions.forEach(
        (item) => {
          const subj =
            subjectForQuestion(
              subjects,
              item.id
            )

          if (
            subj &&
            bySubject[
              subj.key
            ]
          ) {
            bySubject[
              subj.key
            ].total += 1
          }

          const given =
            answers[item.id]

          // Unanswered
          if (
            given ===
            undefined
          ) {
            unanswered += 1
          }

          // Correct
          else if (
            given ===
            item.answer
          ) {
            correct += 1

            score += 1

            if (
              subj &&
              bySubject[
                subj.key
              ]
            ) {
              bySubject[
                subj.key
              ].correct += 1
            }
          }

          // Wrong
          else {
            wrong += 1

            score -=
              NEGATIVE_MARK

            if (
              subj &&
              bySubject[
                subj.key
              ]
            ) {
              bySubject[
                subj.key
              ].wrong += 1
            }
          }
        }
      )

      return {
        correct,
        wrong,
        unanswered,
        total:
          questions.length,
        score,
        bySubject,
      }
    }, [
      submitted,
      answers,
      questions,
      subjects,
    ])

  // ====================================================
  // NO EXAM
  // ====================================================

  if (!currentExam) {
    return (
      <div className="exam-shell">

        <div className="results-shell">

          <div className="stamp-card">

            <h2>
              কোনো পরীক্ষা পাওয়া যায়নি
            </h2>

          </div>

        </div>

      </div>
    )
  }

  // ====================================================
  // RESULTS SCREEN
  // ====================================================

  if (
    submitted &&
    results
  ) {
    return (
      <ResultsScreen
        results={results}
        examTitle={
          currentExam.examTitle
        }
        categoryName={
          currentCategory.name
        }
        onRestart={restart}
        onReview={() =>
          setSubmitted(false)
        }
      />
    )
  }

  // ====================================================
  // EXAM SCREEN
  // ====================================================

  return (
    <div className="exam-shell">

      <ExamHeader
        categoryName={
          currentCategory.name
        }

        examTitle={
          currentExam.examTitle
        }

        examSubtitle={
          currentExam.examSubtitle
        }

        answeredCount={
          answeredCount
        }

        markedCount={
          markedCount
        }

        total={
          questions.length
        }

        secondsLeft={
          secondsLeft
        }

        examStarted={
          examStarted
        }

        onStart={
          startExam
        }

        categories={
          categories
        }

        selectedCategoryId={
          categoryId
        }

        onChangeCategory={
          changeCategory
        }

        exams={
          exams
        }

        selectedExamId={
          examId
        }

        onChangeExam={
          changeExam
        }
      />

      <div className="exam-body">

        {/* OMR */}

        <Navigator
          questions={
            questions
          }
          answers={
            answers
          }
          marked={
            marked
          }
          current={
            visibleId
          }
          onJump={
            goTo
          }
        />

        {/* QUESTIONS */}

        <main
          className="question-list"
          ref={listRef}
        >

          {questions.map(
            (q) => {
              const qSubject =
                subjectForQuestion(
                  subjects,
                  q.id
                )

              const isLocked =
                answers[q.id] !==
                undefined

              return (
                <section
                  key={q.id}
                  id={`q-${q.id}`}
                  data-qid={q.id}
                  className={`question-card ${
                    isLocked
                      ? 'is-locked'
                      : ''
                  } ${
                    !examStarted
                      ? 'exam-not-started'
                      : ''
                  }`}
                  ref={(el) => {
                    questionRefs.current[
                      q.id
                    ] = el
                  }}
                >

                  {/* START MESSAGE */}

                  {!examStarted && (
                    <div className="start-tooltip">

                      পরীক্ষা শুরু করতে উপরের{' '}

                      <strong>
                        Start Exam
                      </strong>{' '}

                      বাটনে ক্লিক করুন

                    </div>
                  )}

                  {/* QUESTION META */}

                  <div className="question-meta">

                    <span className="q-number">
                      প্রশ্ন {q.id}
                    </span>

                    {qSubject && (
                      <span className="subject-chip">
                        {
                          qSubject.name
                        }
                      </span>
                    )}

                    {isLocked && (
                      <span className="locked-chip">
                        লক করা হয়েছে
                      </span>
                    )}

                  </div>

                  {/* QUESTION */}

                  <p className="question-text">
                    {q.prompt}
                  </p>

                  {/* OPTIONS */}

                  <div className="omr-options">

                    {q.options.map(
                      (opt) => {
                        const selected =
                          answers[
                            q.id
                          ] ===
                          opt.id

                        const disabled =
                          isLocked &&
                          !selected

                        return (
                          <button
                            key={
                              opt.id
                            }

                            className={`omr-row ${
                              selected
                                ? 'is-selected'
                                : ''
                            } ${
                              disabled
                                ? 'is-disabled'
                                : ''
                            }`}

                            onClick={() =>
                              selectOption(
                                q.id,
                                opt.id
                              )
                            }

                            disabled={
                              !examStarted ||
                              (
                                isLocked &&
                                !selected
                              )
                            }

                            type="button"
                          >

                            <span
                              className={`bubble ${
                                selected
                                  ? 'filled'
                                  : ''
                              }`}
                            >
                              {String.fromCharCode(
                                2453 +
                                  'abcd'.indexOf(
                                    opt.id
                                  )
                              )}
                            </span>

                            <span className="option-text">
                              {
                                opt.text
                              }
                            </span>

                          </button>
                        )
                      }
                    )}

                  </div>

                  {/* =================================================
                      EXPLANATION
                      ================================================= */}

                 {isLocked && q.explanation && (
  <div
    className={`answer-explanation ${
      answers[q.id] === q.answer
        ? 'explanation-correct'
        : 'explanation-wrong'
    }`}
  >
    {answers[q.id] !== q.answer && (
      <>
        <div className="explanation-title">
          ✕ ভুল উত্তর
        </div>

        <div className="explanation-answer">
          সঠিক উত্তর:{' '}
          <strong>
            {q.options.find(
              (opt) => opt.id === q.answer
            )?.text}
          </strong>
        </div>
      </>
    )}

    <p>{q.explanation}</p>
  </div>
)}
                  {/* MARK */}

                  <div className="panel-controls">

                    <button
                      className="ghost-btn"
                      onClick={() =>
                        toggleMark(
                          q.id
                        )
                      }
                      disabled={
                        !examStarted
                      }
                      type="button"
                    >
                      {marked[q.id]
                        ? 'মার্ক তুলে নাও'
                        : 'পরে দেখার জন্য মার্ক করো'}
                    </button>

                  </div>

                </section>
              )
            }
          )}

          {/* END */}

          <div className="end-of-list">

            <p>
              সবগুলো প্রশ্ন দেখা শেষ।
              উত্তর জমা দিতে নিচের
              বাটনে ক্লিক করো।
            </p>

          </div>

        </main>

      </div>

      {/* FOOTER */}

      <footer className="exam-footer">

        <span className="footer-progress">

          উত্তর দেওয়া হয়েছে:{' '}

          <strong>
            {answeredCount}
          </strong>{' '}

          / {questions.length}

        </span>

        <button
          className="submit-btn"
          onClick={
            handleSubmit
          }
          disabled={
            !examStarted
          }
          type="button"
        >
          জমা দিন
        </button>

      </footer>
      <ScrollToTopButton />

    </div>
  )
}


// ======================================================
// EXAM HEADER
// ======================================================

function ExamHeader({
  categoryName,
  examTitle,
  examSubtitle,
  answeredCount,
  markedCount,
  total,
  secondsLeft,
  examStarted,
  onStart,
  categories,
  selectedCategoryId,
  onChangeCategory,
  exams,
  selectedExamId,
  onChangeExam,
}) {
  return (
    <header className="exam-header">

      {/* HEADER BAND */}

      <div className="header-band">

        <div className="header-title">

          <span className="eyebrow">
            {categoryName}
          </span>

          <h1>
            {examSubtitle}
          </h1>

        </div>

        {/* START / TIMER */}

        {!examStarted ? (
          <button
            className="timer start-btn"
            onClick={onStart}
            type="button"
            title="পরীক্ষা শুরু করুন"
          >
            Start Exam
          </button>
        ) : (
          <div
            className="timer"
            title="অবশিষ্ট সময়"
          >
            {formatTime(
              secondsLeft
            )}
          </div>
        )}

      </div>

      {/* CATEGORY + EXAM */}

      <div className="exam-switcher">

        {/* CATEGORY */}

        <div className="exam-switcher-item">

          <div className="exam-switcher-label">
            ক্যাটাগরি নির্বাচন করুন
          </div>

          <select
            value={
              selectedCategoryId
            }
            onChange={(e) =>
              onChangeCategory(
                e.target.value
              )
            }
            className="exam-select"
            aria-label="ক্যাটাগরি নির্বাচন করুন"
          >

            {categories.map(
              (category) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {category.name}
                </option>
              )
            )}

          </select>

        </div>

        {/* EXAM */}

        <div className="exam-switcher-item">

          <div className="exam-switcher-label">
            নিবন্ধন পরীক্ষা পরিবর্তন করুন
          </div>

          <select
            value={
              selectedExamId
            }
            onChange={(e) =>
              onChangeExam(
                e.target.value
              )
            }
            className="exam-select"
            aria-label="নিবন্ধন পরীক্ষা নির্বাচন করুন"
          >

            {exams.map(
              (exam) => (
                <option
                  key={
                    exam.id
                  }
                  value={
                    exam.id
                  }
                >
                  {exam.examTitle}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {/* INFO STRIP */}

      <div className="info-strip">

        <span>

          উত্তর দেওয়া হয়েছে:{' '}

          <strong>
            {answeredCount}
          </strong>

        </span>

        <span className="divider" />

        <span>

          মার্ক করা:{' '}

          <strong>
            {markedCount}
          </strong>

        </span>

        <span className="divider" />

        <span>

          মোট প্রশ্ন:{' '}

          <strong>
            {total}
          </strong>

        </span>

        <span className="divider" />

        <span>

          ভুল উত্তরে{' '}

          <strong>
            -০.২৫
          </strong>{' '}

          কাটা যাবে

        </span>

      </div>

    </header>
  )
}
function ScrollToTopButton() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!show) {
    return null
  }

  return (
    <button
      className="scroll-top-btn"
      onClick={scrollToTop}
      type="button"
      aria-label="উপরে যান"
      title="উপরে যান"
    >
      ↑
    </button>
  )
}


// ======================================================
// NAVIGATOR / OMR
// ======================================================

function Navigator({
  questions,
  answers,
  marked,
  current,
  onJump,
}) {
  return (
    <aside className="navigator">

      <div className="navigator-title">
        উত্তরপত্র (OMR)
      </div>

      <div className="bubble-grid">

        {questions.map(
          (item) => {

            const isAnswered =
              answers[
                item.id
              ] !== undefined

            const isMarked =
              marked[
                item.id
              ]

            const isCurrent =
              item.id ===
              current

            // Answered + answer wrong
            const isWrong =
              isAnswered &&
              answers[
                item.id
              ] !==
                item.answer

            const classes = [
              'nav-bubble',

              isAnswered
                ? 'answered'
                : '',

              isWrong
                ? 'wrong'
                : '',

              isMarked
                ? 'marked'
                : '',

              isCurrent
                ? 'current'
                : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={
                  item.id
                }
                className={
                  classes
                }
                onClick={() =>
                  onJump(
                    item.id
                  )
                }
                type="button"
                aria-label={`প্রশ্ন ${item.id}${
                  isWrong
                    ? ' - ভুল উত্তর'
                    : ''
                }`}
              >

                <span className="nav-number">
                  {item.id}
                </span>

                {/* WRONG CROSS */}

                {isWrong && (
                  <span className="wrong-cross">
                    ×
                  </span>
                )}

              </button>
            )
          }
        )}

      </div>

      {/* LEGEND */}

      <div className="legend">

        <span>
          <i className="dot answered" />
          উত্তর দেওয়া
        </span>

        <span>
          <i className="dot wrong" />
          ভুল উত্তর
        </span>

        <span>
          <i className="dot marked" />
          মার্ক করা
        </span>

        <span>
          <i className="dot" />
          বাকি আছে
        </span>

      </div>

    </aside>
  )
}


// ======================================================
// RESULTS SCREEN
// ======================================================

function ResultsScreen({
  results,
  examTitle,
  categoryName,
  onRestart,
  onReview,
}) {
  const percent =
    results.total > 0
      ? Math.max(
          0,
          Math.round(
            (
              results.score /
              results.total
            ) * 100
          )
        )
      : 0

  const scoreLabel =
    Number.isInteger(
      results.score
    )
      ? results.score
      : results.score.toFixed(2)

  return (
    <div className="results-shell">

      {/* SCORE CARD */}

      <div className="stamp-card">

        <div className="stamp-circle">

          <span className="stamp-score">
            {scoreLabel}
          </span>

          <span className="stamp-total">
            / {results.total}
          </span>

        </div>

        <div className="stamp-label">
          প্রাপ্ত নম্বর
        </div>

        <div className="stamp-percent">
          {percent}%
        </div>

        <div className="result-exam-title">
          {categoryName} — {examTitle}
        </div>

      </div>

      {/* SUMMARY */}

      <div className="score-summary">

        <span className="summary-chip correct">
          সঠিক: {results.correct}
        </span>

        <span className="summary-chip wrong">

          ভুল: {results.wrong}

          {' '}

          (-{(
            results.wrong *
            NEGATIVE_MARK
          ).toFixed(2)})

        </span>

        <span className="summary-chip skipped">
          বাদ: {results.unanswered}
        </span>

      </div>

      {/* SUBJECT BREAKDOWN */}

      <div className="breakdown">

        <h2>
          বিষয়ভিত্তিক ফলাফল
        </h2>

        {Object.values(
          results.bySubject
        ).map((s) => {

          const pct =
            s.total > 0
              ? Math.max(
                  0,
                  Math.round(
                    (
                      (
                        s.correct -
                        s.wrong *
                          NEGATIVE_MARK
                      ) /
                      s.total
                    ) * 100
                  )
                )
              : 0

          return (
            <div
              className="breakdown-row"
              key={
                s.name
              }
            >

              <span className="breakdown-name">
                {s.name}
              </span>

              <div className="breakdown-bar">

                <div
                  className="breakdown-fill"
                  style={{
                    width: `${pct}%`,
                  }}
                />

              </div>

              <span className="breakdown-score">
                {s.correct}/
                {s.total}
              </span>

            </div>
          )
        })}

      </div>

      {/* ACTIONS */}

      <div className="results-actions">

        <button
          className="ghost-btn"
          onClick={
            onReview
          }
          type="button"
        >
          উত্তরপত্র দেখো
        </button>

        <button
          className="submit-btn"
          onClick={
            onRestart
          }
          type="button"
        >
          আবার পরীক্ষা দাও
        </button>

      </div>

    </div>
  )
}