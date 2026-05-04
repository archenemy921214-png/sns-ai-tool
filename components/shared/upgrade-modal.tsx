'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const router = useRouter()

  function handleUpgrade() {
    onClose()
    router.push('/pricing')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="text-4xl mb-2">✨</div>
          <DialogTitle>AI生成の上限に達しました</DialogTitle>
          <DialogDescription className="pt-1">
            Freeプランは月3回まで利用できます。<br />
            Proプランにアップグレードすると<strong>無制限</strong>でご利用いただけます。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          <p className="text-2xl font-bold text-violet-600">¥980<span className="text-sm font-normal text-gray-500">/月</span></p>
          <Button
            className="w-full bg-violet-600 hover:bg-violet-700"
            onClick={handleUpgrade}
          >
            Proにアップグレード
          </Button>
          <button
            onClick={onClose}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full text-gray-500')}
          >
            キャンセル
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
