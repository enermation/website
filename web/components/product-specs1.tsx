'use client'

import { mdiChevronDown } from '@mdi/js'
import { Icon } from '@mdi/react'
import { useState } from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Spec {
  label: string
  value: string
}

interface SpecCategory {
  id: string
  name: string
  icon: React.ReactNode
  specs: Spec[]
}

interface ProductSpecs1Props {
  categories: SpecCategory[]
  title?: string
  className?: string
}

const ProductSpecs1 = ({
  categories,
  title = 'Technical Specifications',
  className,
}: ProductSpecs1Props) => {
  const [openCategories, setOpenCategories] = useState<string[]>(categories.map(c => c.id))

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]))
  }

  const expandAll = () => setOpenCategories(categories.map(c => c.id))
  const collapseAll = () => setOpenCategories([])

  const showControls = categories.length > 1

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="w-full">
        {(title || showControls) && (
          <div className="mb-8 flex items-center justify-between">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
            )}
            {showControls && (
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={expandAll}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Expand all
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Collapse all
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {categories.map(category => (
            <Collapsible
              key={category.id}
              open={openCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <div className="rounded-lg border">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                      {category.icon}
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Icon
                    path={mdiChevronDown}
                    size={1}
                    className={cn(
                      'size-5 text-muted-foreground transition-transform',
                      openCategories.includes(category.id) && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t">
                    <Table>
                      <TableBody>
                        {category.specs.map(spec => (
                          <TableRow key={spec.label} className="hover:bg-transparent">
                            <TableCell className="w-1/2 py-3 text-muted-foreground">
                              {spec.label}
                            </TableCell>
                            <TableCell className="py-3 font-medium">{spec.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  )
}

export { ProductSpecs1 }
