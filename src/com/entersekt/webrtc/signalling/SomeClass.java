package com.entersekt.webrtc.signalling;

import java.util.Optional;

import org.nextrtc.signalingserver.domain.Member;
import org.nextrtc.signalingserver.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;

public class SomeClass {
	@Autowired
	public MemberRepository members;

	public void fetchById(String id) {
		Optional<Member> memberOptional = members.findBy(id);
	}
}