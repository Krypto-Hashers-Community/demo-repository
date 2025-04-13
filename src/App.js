import React from 'react';
import styled from 'styled-components';
import logo from './assets/logo.png';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: white;
`;

const Header = styled.header`
  padding: 2rem;
  text-align: center;
`;

const Logo = styled.img`
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #4fd1c5;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Section = styled.section`
  margin: 4rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #4fd1c5;
  margin-bottom: 2rem;
`;

const Description = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <Logo src={logo} alt="Krypto Hashers Logo" />
        <Title>Krypto Hashers Community</Title>
        <Description>A community of blockchain enthusiasts and crypto innovators</Description>
      </Header>

      <MainContent>
        <Section>
          <SectionTitle>About Us</SectionTitle>
          <Description>
            We are a passionate community of blockchain developers, crypto enthusiasts, and innovators
            working together to shape the future of decentralized technology.
          </Description>
        </Section>

        <Section>
          <SectionTitle>Our Mission</SectionTitle>
          <Description>
            To foster innovation, collaboration, and knowledge sharing in the blockchain space
            while building cutting-edge solutions for the crypto ecosystem.
          </Description>
        </Section>

        <Section>
          <SectionTitle>Join Our Community</SectionTitle>
          <Description>
            Connect with like-minded individuals, participate in exciting projects, and contribute
            to the future of blockchain technology.
          </Description>
        </Section>
      </MainContent>
    </AppContainer>
  );
}

export default App; 