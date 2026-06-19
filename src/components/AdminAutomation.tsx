import React from 'react';
import { Language } from '../types';
import AdminHeroPhotoManager from './AdminHeroPhotoManager';

type Props = {
  language: Language;
  onBack?: () => void;
  [key: string]: any;
};

export default function AdminAutomation(props: Props) {
  return <AdminHeroPhotoManager language={props.language || 'en'} />;
}
