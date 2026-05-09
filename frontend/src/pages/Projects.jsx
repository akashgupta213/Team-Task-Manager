import { useState, useEffect } from 'react'
import { projectAPI } from '../api'
import { Card, Button, Input, Textarea, Modal, Badge, Spinner, EmptyState, Alert } from '../components/ui/UI'
import styles from './Projects.module.css'
import ProjectDetail from './ProjectDetail'

export default function Projects() {
  const [projects, setProjects]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [showCreate, setShowCreate]     = useState(false)
  const [selectedProject, setSelected] = useState(null)
  const [form, setForm]                 = useState({ name: '', description: '' })
  const [error, setError]               = useState('')
  const [creating, setCreating]         = useState(false)

  const fetchProjects = async () => {
    try {
      const { data } = await projectAPI.getAll()
      setProjects(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await projectAPI.create(form)
      setForm({ name: '', description: '' })
      setShowCreate(false)
      fetchProjects()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  if (selectedProject) return (
    <ProjectDetail
      project={selectedProject}
      onBack={() => { setSelected(null); fetchProjects() }}
    />
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.sub}>{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Project</Button>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}><Spinner size={32} /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No projects yet"
          description="Create your first project to start assigning tasks to your team"
          action={<Button onClick={() => setShowCreate(true)}>Create project</Button>}
        />
      ) : (
        <div className={styles.grid}>
          {projects.map(p => (
            <Card key={p._id} className={styles.projectCard} onClick={() => setSelected(p)}>
              <div className={styles.cardTop}>
                <div className={styles.avatar}>{p.name.charAt(0).toUpperCase()}</div>
                <div className={styles.arrow}>→</div>
              </div>
              <h3 className={styles.projectName}>{p.name}</h3>
              <p className={styles.projectDesc}>{p.description || 'No description'}</p>
              <div className={styles.cardFooter}>
                <span className={styles.created}>
                  {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <form onSubmit={handleCreate}>
          <Alert message={error} />
          <Input label="Project name" placeholder="e.g. Website Redesign"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Textarea label="Description" placeholder="What is this project about?"
            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          <Button type="submit" fullWidth loading={creating}>Create Project</Button>
        </form>
      </Modal>
    </div>
  )
}
