import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/leafAssets/logo.png';
import professionalData from '../../commons/professionalData';
import { Leaf, LogIn } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg) 0%, var(--surface-alt) 100%);
  padding: 20px;
`;

const Card = styled.div`
  background: var(--surface);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

const LogoWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: ${professionalData.primaryColor};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 10px 20px rgba(70, 70, 70, 0.2);

  img {
    width: 50px;
    filter: brightness(0) invert(1);
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 32px;
  line-height: 1.5;
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  background: #fff;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 12px;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);

  &:hover {
    background: #f8f9fa;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg.google-logo {
    width: 20px;
    height: 20px;
  }
`;

const GoogleLogoSVG = () => (
  <svg className="google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FooterText = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  margin: 24px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const SignIn = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <Container>
      <Card>
        <LogoWrapper>
          <img src={Logo} alt="Logo" />
        </LogoWrapper>
        <Title>Bienvenido</Title>
        <Subtitle>
          Inicia sesión para gestionar tus pacientes, recetas, presupuestos y respaldos de forma segura.
        </Subtitle>
        
        <GoogleButton onClick={signInWithGoogle}>
          <GoogleLogoSVG />
          Continuar con Google
        </GoogleButton>

        <FooterText>
          Desarrollado por leaf4web <Leaf size={12} color="var(--accent)" />
        </FooterText>
      </Card>
    </Container>
  );
};

export default SignIn;
