import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  TimerReset,
  X,
} from 'lucide-react'

type Subject = {
  name: string
  topic: string
  progress: number
  color: string
  icon: typeof BookOpen
  lessons: string
  time: string
}

type Session = {
  id: number
  subject: string
  detail: string
  time: string
  duration: string
  color: string
  icon: 'target' | 'brain' | 'book'
  done: boolean
}

const sessionIcons = { target: Target, brain: Brain, book: BookOpen }

const initialSubjects: Subject[] = [
  { name: 'Matemática', topic: 'Funções e gráficos', progress: 72, color: 'mint', icon: Target, lessons: '8 de 12 aulas', time: '3h 40min' },
  { name: 'Biologia', topic: 'Genética molecular', progress: 48, color: 'lilac', icon: Brain, lessons: '6 de 14 aulas', time: '2h 15min' },
  { name: 'História', topic: 'Brasil República', progress: 35, color: 'peach', icon: LibraryBig, lessons: '5 de 10 aulas', time: '1h 50min' },
]

const initialSessions: Session[] = [
  { id: 1, subject: 'Matemática', detail: 'Funções do 2º grau', time: '09:00', duration: '45 min', color: 'mint', icon: 'target', done: true },
  { id: 2, subject: 'Biologia', detail: 'DNA e síntese proteica', time: '10:30', duration: '50 min', color: 'lilac', icon: 'brain', done: false },
  { id: 3, subject: 'Redação', detail: 'Repertório sociocultural', time: '14:00', duration: '40 min', color: 'peach', icon: 'book', done: false },
]

const week = [
  { day: 'Seg', value: 55 }, { day: 'Ter', value: 78 }, { day: 'Qua', value: 42 },
  { day: 'Qui', value: 91 }, { day: 'Sex', value: 64 }, { day: 'Sáb', value: 34 }, { day: 'Dom', value: 17 },
]

const navItems = [
  { name: 'Visão geral', icon: LayoutDashboard },
  { name: 'Plano de estudos', icon: CalendarDays },
  { name: 'Matérias', icon: BookOpen },
  { name: 'Revisões', icon: Brain },
  { name: 'Estatísticas', icon: Target },
]

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function readSessions(): Session[] {
  return readStored<Session[]>('nexo-sessions', initialSessions).map((session) => ({
    ...session,
    icon: session.icon in sessionIcons ? session.icon : 'book',
  }))
}

function App() {
  const [activeNav, setActiveNav] = useState('Visão geral')
  const [sessions, setSessions] = useState<Session[]>(readSessions)
  const [minutes, setMinutes] = useState(() => readStored('nexo-minutes', 25))
  const [seconds, setSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showAddSession, setShowAddSession] = useState(false)
  const [toast, setToast] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newDetail, setNewDetail] = useState('')
  const [newTime, setNewTime] = useState('16:00')
  const [activeDay, setActiveDay] = useState('Qui')

  const navigateTo = (name: string) => {
    setActiveNav(name)
    setMobileMenu(false)
    const targets: Record<string, string> = {
      'Visão geral': '.welcome-row',
      'Plano de estudos': '.schedule-panel',
      'Matérias': '.subjects-panel',
      'Revisões': '.review-card',
      'Estatísticas': '.weekly-panel',
    }
    window.setTimeout(() => document.querySelector(targets[name])?.scrollIntoView({ behavior: 'smooth', block: name === 'Visão geral' ? 'start' : 'center' }), 0)
  }

  useEffect(() => localStorage.setItem('nexo-sessions', JSON.stringify(sessions)), [sessions])
  useEffect(() => localStorage.setItem('nexo-minutes', JSON.stringify(minutes)), [minutes])

  useEffect(() => {
    if (!timerRunning) return
    const interval = window.setInterval(() => {
      setSeconds((currentSeconds) => {
        if (currentSeconds > 0) return currentSeconds - 1
        setMinutes((currentMinutes) => {
          if (currentMinutes <= 1) {
            setTimerRunning(false)
            setToast('Sessão concluída. Mandou bem!')
            window.setTimeout(() => setToast(''), 3200)
            return 25
          }
          return currentMinutes - 1
        })
        return 59
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [timerRunning])

  const filteredSubjects = initialSubjects.filter((subject) =>
    `${subject.name} ${subject.topic}`.toLowerCase().includes(search.toLowerCase()),
  )

  const completeSession = (id: number) => {
    setSessions((current) => current.map((session) => session.id === id ? { ...session, done: !session.done } : session))
  }

  const addSession = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newSubject.trim() || !newDetail.trim()) return
    setSessions((current) => [...current, {
      id: Date.now(), subject: newSubject.trim(), detail: newDetail.trim(), time: newTime,
      duration: '45 min', color: 'sky', icon: 'book' as const, done: false,
    }].sort((a, b) => a.time.localeCompare(b.time)))
    setNewSubject('')
    setNewDetail('')
    setShowAddSession(false)
    setToast('Sessão adicionada ao seu plano.')
    window.setTimeout(() => setToast(''), 2800)
  }

  const resetTimer = () => {
    setTimerRunning(false)
    setMinutes(25)
    setSeconds(0)
  }

  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  const completedCount = sessions.filter((session) => session.done).length

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#inicio" onClick={() => navigateTo('Visão geral')} aria-label="Nexo Estudos, início">
          <span className="brand-mark"><GraduationCap size={22} strokeWidth={2.3} /></span>
          <span className="brand-name">nexo<span>.</span></span>
        </a>

        <div className="workspace-label">SEU ESPAÇO</div>
        <nav className="primary-nav" aria-label="Navegação principal">
          {navItems.map(({ name, icon: Icon }) => (
            <button key={name} className={`nav-item ${activeNav === name ? 'nav-active' : ''}`} onClick={() => navigateTo(name)}>
              <Icon size={18} strokeWidth={1.9} />
              <span>{name}</span>
              {name === 'Revisões' && <span className="nav-count">3</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="workspace-label">PESSOAL</div>
        <button className="nav-item" onClick={() => setToast('Suas anotações estão em dia!')}><LibraryBig size={18} /><span>Minhas anotações</span></button>
        <button className="nav-item" onClick={() => setToast('Configurações atualizadas.')}><Settings2 size={18} /><span>Configurações</span></button>

        <div className="sidebar-spacer" />
        <div className="sidebar-quote">
          <div className="quote-sparkle"><Sparkles size={16} /></div>
          <p>Pequenos passos todos os dias levam a grandes conquistas.</p>
          <span>CONTINUE NO SEU RITMO</span>
        </div>
        <button className="sidebar-help" onClick={() => setToast('Estamos aqui para ajudar.')}><CircleHelp size={17} /><span>Central de ajuda</span><ArrowUpRight size={14} /></button>
      </aside>

      {mobileMenu && <button className="mobile-backdrop" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" aria-label="Abrir menu" onClick={() => setMobileMenu(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Seu espaço</span><ChevronRight size={15} /><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <div className={`search-box ${showSearch ? 'search-open' : ''}`}>
              <Search size={17} />
              <input aria-label="Buscar matérias" placeholder="Buscar matéria..." value={search} onChange={(event) => { setSearch(event.target.value); setShowSearch(true) }} onFocus={() => setShowSearch(true)} />
              {search && <button className="search-clear" aria-label="Limpar busca" onClick={() => setSearch('')}><X size={14} /></button>}
              {!search && <kbd>⌘ K</kbd>}
              {showSearch && search && (
                <div className="search-results">
                  {filteredSubjects.length ? filteredSubjects.map((subject) => (
                    <button key={subject.name} onClick={() => { setShowSearch(false); navigateTo('Matérias') }}><span className={`mini-subject-icon ${subject.color}`}><subject.icon size={16} /></span><span><strong>{subject.name}</strong><small>{subject.topic}</small></span><ArrowUpRight size={14} /></button>
                  )) : <div className="search-empty">Nenhuma matéria encontrada.</div>}
                </div>
              )}
            </div>
            <div className="popover-wrap">
              <button className={`icon-button notification-button ${showNotifications ? 'icon-button-selected' : ''}`} aria-label="Notificações" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}><Bell size={18} /><i /></button>
              {showNotifications && <div className="floating-popover notification-popover"><div className="popover-heading">Notificações <span>2 novas</span></div><div className="notification-row"><span className="notification-dot" /><div><strong>Hora de revisar!</strong><p>Genética molecular está na sua lista de hoje.</p><small>Há 20 minutos</small></div></div><div className="notification-row"><span className="notification-dot coral-dot" /><div><strong>Meta semanal quase lá</strong><p>Faltam só 1h 20min para bater sua meta.</p><small>Há 2 horas</small></div></div></div>}
            </div>
            <div className="profile-wrap">
              <button className="profile-button" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }} aria-label="Abrir perfil"><span className="avatar">G</span><span className="profile-name">Gerson</span><ChevronDown size={14} /></button>
              {showProfile && <div className="floating-popover profile-popover"><div className="profile-card-name"><span className="avatar">G</span><span><strong>Gerson</strong><small>Estudante</small></span></div><button onClick={() => { setShowProfile(false); navigateTo('Estatísticas') }}>Meu progresso <ArrowUpRight size={14} /></button><button onClick={() => { setShowProfile(false); setToast('Configurações abertas.') }}>Configurações <ArrowUpRight size={14} /></button></div>}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div>
              <div className="date-overline"><span className="date-dot" />{today.charAt(0).toUpperCase() + today.slice(1)}</div>
              <h1>{activeNav === 'Visão geral' ? <>Bom dia, Gerson<span className="heading-period">.</span></> : <>{activeNav}<span className="heading-period">.</span></>}</h1>
              <p className="welcome-copy">Um passo de cada vez. Você está construindo algo incrível.</p>
            </div>
            <button className="week-selector" onClick={() => setToast('Você está vendo a semana atual.')}><CalendarDays size={16} /><span>Esta semana</span><ChevronDown size={14} /></button>
          </section>

          <section className="stats-grid" aria-label="Resumo do seu progresso">
            <article className="stat-card stat-focus">
              <div className="stat-top"><span className="stat-label">TEMPO DE ESTUDO</span><span className="stat-icon stat-icon-green"><Clock3 size={17} /></span></div>
              <div className="stat-value">12<span>h</span> 40<span>min</span></div>
              <div className="stat-foot"><span className="trend-up"><ArrowUpRight size={14} /> 18%</span><span>vs. semana passada</span><div className="stat-sparkline"><i /><i /><i /><i /><i /><i /><i /></div></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-label">SEQUÊNCIA ATUAL</span><span className="stat-icon stat-icon-coral"><Flame size={17} /></span></div>
              <div className="stat-value">8<span> dias</span></div>
              <div className="streak-dots" aria-label="Estudou nos últimos 7 dias"><span /><span /><span /><span /><span /><span /><span /></div>
              <div className="stat-foot"><span className="stat-muted">Seu recorde é de 12 dias. Continue!</span></div>
            </article>
            <article className="stat-card stat-goal-card">
              <div className="stat-top"><span className="stat-label">META DA SEMANA</span><span className="stat-icon stat-icon-lilac"><Target size={17} /></span></div>
              <div className="stat-value">12<span>h</span> <small>de 16h</small></div>
              <div className="goal-track"><span /></div>
              <div className="stat-foot"><span className="goal-remaining">Faltam 4 horas</span><span>75% concluído</span></div>
            </article>
            <article className="stat-card stat-done-card">
              <div className="stat-top"><span className="stat-label">SESSÕES CONCLUÍDAS</span><span className="stat-icon stat-icon-blue"><CheckCircle2 size={17} /></span></div>
              <div className="stat-value">{completedCount.toString().padStart(2, '0')}<span> / {sessions.length.toString().padStart(2, '0')}</span></div>
              <div className="stat-foot"><span className="stat-muted">Sessões registradas esta semana</span></div>
              <div className="session-progress"><span style={{ width: `${sessions.length ? completedCount / sessions.length * 100 : 0}%` }} /></div>
            </article>
          </section>

          <section className="focus-banner">
            <div className="focus-left">
              <span className="focus-eyebrow"><span className="live-dot" /> SEU MOMENTO DE FOCO</span>
              <h2>Uma coisa de cada vez<span>.</span></h2>
              <p>Reserve um tempo para você e deixe o resto para depois.</p>
              <div className="focus-buttons">
                <button className="focus-start" onClick={() => setTimerRunning(!timerRunning)}>{timerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />} {timerRunning ? 'Pausar sessão' : 'Começar a estudar'}</button>
                <button className="focus-reset" onClick={resetTimer} aria-label="Reiniciar cronômetro" title="Reiniciar cronômetro"><TimerReset size={17} /></button>
                <span className="focus-duration"><Clock3 size={14} /> Pomodoro · 25 min</span>
              </div>
            </div>
            <div className="focus-timer" aria-label={`Tempo restante: ${minutes} minutos e ${seconds} segundos`}>
              <svg viewBox="0 0 160 160" role="img" aria-label="Progresso do cronômetro">
                <circle className="timer-track" cx="80" cy="80" r="69" />
                <circle className="timer-progress" cx="80" cy="80" r="69" style={{ strokeDashoffset: 433.5 * (1 - ((25 - minutes + (seconds ? 1 - seconds / 60 : 0)) / 25)) }} />
              </svg>
              <div className="timer-readout"><strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong><span>{timerRunning ? 'EM FOCO' : 'PRONTO PARA COMEÇAR'}</span></div>
              <span className="timer-sparkle"><Sparkles size={17} /></span>
            </div>
            <div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" />
          </section>

          <section className="content-grid">
            <article className="panel schedule-panel">
              <div className="panel-header">
                <div><div className="panel-kicker">NO SEU PLANO</div><h2>Sua rotina de hoje</h2></div>
                <button className="text-action" onClick={() => navigateTo('Plano de estudos')}>Ver plano completo <ArrowRight size={15} /></button>
              </div>
              <div className="schedule-date"><button className="icon-button compact-button" aria-label="Dia anterior"><ChevronLeft size={17} /></button><strong>{today.charAt(0).toUpperCase() + today.slice(1)}</strong><button className="icon-button compact-button" aria-label="Próximo dia"><ChevronRight size={17} /></button><span className="today-pill">HOJE</span></div>
              <div className="schedule-list">
                {sessions.map((session) => {
                  const Icon = sessionIcons[session.icon]
                  return <div className={`schedule-item ${session.done ? 'schedule-item-done' : ''}`} key={session.id}>
                    <div className="schedule-time">{session.time}<span>{session.duration}</span></div>
                    <div className={`schedule-icon ${session.color}`}><Icon size={19} /></div>
                    <div className="schedule-info"><strong>{session.subject}</strong><span>{session.detail}</span></div>
                    {session.done ? <button className="session-done" onClick={() => completeSession(session.id)}><Check size={15} /><span>Concluído</span></button> : <button className="session-start" onClick={() => { setMinutes(25); setSeconds(0); setTimerRunning(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Play size={13} fill="currentColor" /><span>Começar</span></button>}
                  </div>
                })}
              </div>
              <button className="add-session" onClick={() => setShowAddSession(true)}><Plus size={16} />Adicionar sessão</button>
            </article>

            <article className="panel weekly-panel">
              <div className="panel-header">
                <div><div className="panel-kicker">SEU RITMO</div><h2>Esta semana</h2></div>
                <button className="icon-button more-button" aria-label="Mais opções" onClick={() => setToast('Resumo da semana atual.') }><MoreHorizontal size={19} /></button>
              </div>
              <div className="weekly-total"><strong>12h 40min</strong><span className="weekly-comparison"><ArrowUpRight size={14} /> 18%</span><span className="weekly-period">de tempo estudado</span></div>
              <div className="chart-area" role="img" aria-label="Gráfico de horas de estudo por dia nesta semana">
                <div className="chart-y-labels"><span>4h</span><span>3h</span><span>2h</span><span>1h</span><span>0</span></div>
                <div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><div className="chart-bars">{week.map((item) => <button key={item.day} className={`chart-bar-wrap ${item.day === activeDay ? 'chart-day-active' : ''}`} onClick={() => setActiveDay(item.day)} aria-label={`${item.day}: ${Math.round(item.value * 2.4 / 100 * 10) / 10} horas`}><span className="chart-tooltip">{Math.round(item.value * 2.4 / 100 * 10) / 10}h</span><span className="chart-bar" style={{ height: `${item.value}%` }} /><span className="chart-day">{item.day}</span></button>)}</div></div>
              </div>
              <div className="chart-foot"><span><i className="chart-legend-dot" />Tempo de estudo</span><span>Meta diária <strong>~2h 20min</strong></span></div>
            </article>
          </section>

          <section className="content-grid lower-grid">
            <article className="panel subjects-panel">
              <div className="panel-header">
                <div><div className="panel-kicker">SEU APRENDIZADO</div><h2>Continue de onde parou</h2></div>
                <button className="text-action" onClick={() => navigateTo('Matérias')}>Todas as matérias <ArrowRight size={15} /></button>
              </div>
              <div className="subject-list">
                {filteredSubjects.map((subject) => {
                  const Icon = subject.icon
                  return <button className="subject-row" key={subject.name} onClick={() => { navigateTo('Matérias'); setToast(`Abrindo ${subject.name}.`) }}>
                    <span className={`subject-icon ${subject.color}`}><Icon size={19} /></span>
                    <span className="subject-main"><strong>{subject.name}</strong><small>{subject.topic}</small></span>
                    <span className="subject-lessons">{subject.lessons}</span>
                    <span className="subject-progress-wrap"><span className="subject-track"><i className={subject.color} style={{ width: `${subject.progress}%` }} /></span><strong>{subject.progress}%</strong></span>
                    <ArrowUpRight className="subject-arrow" size={16} />
                  </button>
                })}
                {!filteredSubjects.length && <div className="subject-empty">Nenhuma matéria combina com a sua busca.</div>}
              </div>
            </article>

            <article className="review-card">
              <div className="review-top"><span className="review-icon"><Brain size={18} /></span><span className="review-label">REVISÃO INTELIGENTE</span><button className="review-more" aria-label="Mais opções de revisão" onClick={() => setActiveNav('Revisões')}><MoreHorizontal size={19} /></button></div>
              <div className="review-count"><strong>3</strong><span>assuntos para revisar</span></div>
              <p className="review-description">Revisar no momento certo ajuda a fixar o que você aprendeu.</p>
              <div className="review-topics"><span>Genética molecular</span><span>Regra de três</span><span>Era Vargas</span></div>
              <button className="review-button" onClick={() => navigateTo('Revisões')}>Fazer revisões <ArrowRight size={15} /></button>
            </article>
          </section>

          <footer className="dashboard-footer"><span><span className="footer-brand">nexo<span>.</span></span> Aprender no seu tempo.</span><span>Feito para o seu próximo passo <Sparkles size={13} /></span></footer>
        </div>
      </main>

      {showAddSession && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAddSession(false) }}><section className="session-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-top"><span className="modal-icon"><Plus size={18} /></span><button className="icon-button" aria-label="Fechar" onClick={() => setShowAddSession(false)}><X size={19} /></button></div><h2 id="modal-title">Uma nova sessão</h2><p>Um plano simples já é um ótimo começo.</p><form onSubmit={addSession}><label>Matéria<input autoFocus value={newSubject} onChange={(event) => setNewSubject(event.target.value)} placeholder="Ex.: Química" required /></label><label>O que você vai estudar?<input value={newDetail} onChange={(event) => setNewDetail(event.target.value)} placeholder="Ex.: Ligações químicas" required /></label><label>Horário<input type="time" value={newTime} onChange={(event) => setNewTime(event.target.value)} required /></label><button className="modal-submit" type="submit">Adicionar ao plano <ArrowRight size={16} /></button></form></section></div>}

      {toast && <div className="toast-message"><span><Check size={15} /></span>{toast}<button aria-label="Dispensar" onClick={() => setToast('')}><X size={14} /></button></div>}
      <button className="click-catcher" aria-label="Fechar menus" tabIndex={-1} onClick={() => { setShowNotifications(false); setShowProfile(false); setShowSearch(false) }} hidden={!showNotifications && !showProfile && !(showSearch && !search)} />
    </div>
  )
}

export default App