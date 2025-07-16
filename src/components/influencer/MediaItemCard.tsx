import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface MediaItem {
  id: string;
  url: string;
  description: string;
}

interface MediaItemCardProps {
  item: MediaItem;
  type: 'images' | 'videos' | 'links' | 'documents';
  onUpdate: (type: 'images' | 'videos' | 'links' | 'documents', id: string, field: keyof MediaItem, value: string) => void;
  onRemove: (type: 'images' | 'videos' | 'links' | 'documents', id: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function MediaItemCard({
  item,
  type,
  onUpdate,
  onRemove,
  placeholder,
  disabled = false
}: MediaItemCardProps) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium capitalize">{type.slice(0, -1)}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(type, item.id)}
            disabled={disabled}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor={`url-${item.id}`} className="text-xs">URL *</Label>
            <Input
              id={`url-${item.id}`}
              value={item.url}
              onChange={(e) => onUpdate(type, item.id, 'url', e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              type="url"
            />
          </div>
          
          <div>
            <Label htmlFor={`desc-${item.id}`} className="text-xs">Description</Label>
            <Input
              id={`desc-${item.id}`}
              value={item.description}
              onChange={(e) => onUpdate(type, item.id, 'description', e.target.value)}
              placeholder="Brief description of this item"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}