package com.entersekt.webrtc.rest;

import java.io.Serializable;

public class Pair implements Serializable {

	public String name;
	public String value;

	public Pair(String name, String value) {
		super();
		this.name = name;
		this.value = value;
	}

	public Pair() {
		super();
	}

	private static final long serialVersionUID = 1L;

}
