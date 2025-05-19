import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "rounded-lg border border-border bg-bg-card text-text-main shadow-sm backdrop-blur-sm hover:bg-bg-card-hover transition-colors",
      className
    )} 
    {...props} 
  />
))
Card.displayName = "Card"

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn("p-4 border-b border-border", className)}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h2 className={cn("text-lg font-bold text-text-main", className)}>
      {children}
    </h2>
  );
};

export { Card, CardHeader, CardContent, CardTitle }

