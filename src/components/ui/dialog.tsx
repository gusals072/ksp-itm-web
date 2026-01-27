import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "../../lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    asChild
    {...props}
  >
    <motion.div
      className={cn(
        "fixed inset-0 z-50 bg-black/20",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  </DialogPrimitive.Overlay>
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideClose?: boolean;
  overlayOpacity?: number;
  isClosing?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideClose = false, overlayOpacity, isClosing = false, ...props }, ref) => {
  // z-index가 높게 설정된 경우 overlay도 함께 높임
  const hasHighZIndex = className?.includes('z-[');
  // z-index 값을 추출하여 overlay는 content보다 1 낮게 설정
  const zIndexMatch = className?.match(/z-\[(\d+)\]/);
  const contentZIndex = zIndexMatch ? parseInt(zIndexMatch[1]) : undefined;
  const overlayZIndex = contentZIndex ? `z-[${contentZIndex - 1}]` : (hasHighZIndex ? 'z-[9999]' : undefined);
  const finalOverlayOpacity = overlayOpacity !== undefined ? overlayOpacity : 1;
  
  return (
  <DialogPortal>
    {overlayZIndex ? (
      <DialogPrimitive.Overlay asChild>
        <motion.div
          className="fixed inset-0 bg-black/50"
          style={{
            // z-index를 인라인 스타일로 직접 설정하여 우선순위 보장
            zIndex: contentZIndex ? contentZIndex - 1 : (hasHighZIndex ? 9999 : 49)
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: finalOverlayOpacity * 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </DialogPrimitive.Overlay>
    ) : (
      overlayOpacity !== undefined ? (
        <DialogPrimitive.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-50 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: overlayOpacity * 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </DialogPrimitive.Overlay>
      ) : (
        <DialogOverlay />
      )
    )}
    <DialogPrimitive.Content
      ref={ref}
      asChild
      onInteractOutside={(e) => {
        // 파일 입력 다이얼로그가 열릴 때 모달이 닫히지 않도록
        const target = e.target as HTMLElement;
        // 파일 입력 버튼 클릭 시 모달 닫힘 방지
        if (target.closest('[data-file-attach-button="true"]')) {
          e.preventDefault();
          return;
        }
        // 파일 입력 요소 자체 클릭 시 모달 닫힘 방지
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'file') {
          e.preventDefault();
          return;
        }
        // 댓글 입력 영역 클릭 시 모달 닫힘 방지
        if (target.closest('textarea') || 
            target.closest('form') ||
            target.closest('[data-comment-area="true"]')) {
          e.preventDefault();
          return;
        }
        // 댓글 컨테이너(Portal로 렌더링된) 클릭 시 모달 닫힘 방지
        const commentContainer = document.querySelector('[data-comment-container="true"]');
        if (commentContainer && commentContainer.contains(target)) {
          e.preventDefault();
          return;
        }
      }}
      {...props}
    >
      <motion.div
        className={cn(
          "fixed grid w-full gap-4 border border-gray-200 bg-white p-6 shadow-lg rounded-lg",
          className
        )}
        {...(className?.includes('max-w-4xl') || className?.includes('max-w-[1344px]') || className?.includes('max-w-[1050px]') || className?.includes('max-w-[900px]') ? {
          // 이슈 상세 모달 및 의견 모달: scale만 사용
          initial: { opacity: 0, scale: 0.95 },
          animate: className?.includes('max-w-[1344px]') && isClosing
            ? { opacity: 0, x: 100 } // 이슈 상세 모달은 슬라이드 아웃
            : { opacity: 1, scale: 1 },
          exit: className?.includes('max-w-[1344px]') 
            ? { opacity: 0, x: 100 } // 이슈 상세 모달은 슬라이드 아웃
            : { opacity: 0, scale: 0.95 }
        } : {
          // 주소록 모달 등: scale + 중앙 정렬 (x, y 사용)
          initial: { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' },
          animate: { opacity: 1, scale: 1, x: '-50%', y: '-50%' },
          exit: { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }
        })}
        transition={{ 
          duration: className?.includes('max-w-[1344px]') ? 0.5 : 0.2, 
          ease: "easeOut" 
        }}
        style={{
          // z-index를 인라인 스타일로 직접 설정하여 우선순위 보장 (CSS 클래스보다 우선)
          zIndex: contentZIndex || (hasHighZIndex ? 9999 : 50),
          ...(className?.includes('max-w-4xl') || className?.includes('max-w-[1344px]') ? {
            // 이슈 상세 모달: 중앙 정렬
            // max-w-[1344px] = 84rem
            // 전체 화면 기준 중앙: 50% - 42rem (84rem / 2)
            // 사이드바(16rem) 고려: 50% - 42rem + 8rem = 50% - 34rem
            left: 'calc(50% - 34rem)',
            top: '5%',
            transform: 'translateY(-50%)'
          } : className?.includes('max-w-[1050px]') ? {
            // 의견 상세 모달: 1050px (65.625rem)
            // 화면 정중앙에 배치 (이슈 상세 모달 위에 완전히 오버레이)
            // 전체 화면 기준 중앙: 50% - 32.8125rem (65.625rem / 2)
            left: 'calc(50% - 32.8125rem)',
            top: '50%',
            transform: 'translateY(-50%)'
          } : className?.includes('max-w-[900px]') ? {
            // 의견 추가 모달: 900px (56.25rem)
            // 화면 정중앙에 배치 (이슈 상세 모달 위에 완전히 오버레이)
            // 전체 화면 기준 중앙: 50% - 28.125rem (56.25rem / 2)
            left: 'calc(50% - 28.125rem)',
            top: '50%',
            transform: 'translateY(-50%)'
          } : {
            // 주소록 모달 등 다른 모달: 중앙 정렬 (framer-motion의 x, y로 처리)
            left: 'calc(50% + 8rem)', // 사이드바(16rem)의 절반인 8rem을 더해서 콘텐츠 영역 중앙에 위치
            top: '50%'
          })
        }}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-water-blue-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </motion.div>
    </DialogPrimitive.Content>
  </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// VisuallyHidden 컴포넌트 (스크린 리더용)
const VisuallyHidden = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
      "clip-path-[inset(50%)]",
      className
    )}
    style={{
      clip: "rect(0, 0, 0, 0)",
      clipPath: "inset(50%)",
    }}
    {...props}
  >
    {children}
  </div>
))
VisuallyHidden.displayName = "VisuallyHidden"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  VisuallyHidden,
}

